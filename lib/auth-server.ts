// Server-only auth utilities (uses jsonwebtoken)
// This file should only be imported in API routes (server-side)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const COOKIE_NAME = 'admin_session'

export interface AdminSession {
  userId: string
  username: string
  fullName: string
  userType: string
}

// Generate JWT token
export function generateToken(payload: AdminSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

// Verify JWT token
export function verifyToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession
  } catch {
    return null
  }
}

// Get session from request
export async function getSession(request: NextRequest): Promise<AdminSession | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// Set session cookie
export function setSessionCookie(response: NextResponse, session: AdminSession) {
  const token = generateToken(session)
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })
  // Also set a response header to help with debugging
  response.headers.set('X-Session-Set', 'true')
  return response
}

// Clear session cookie
export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(COOKIE_NAME)
  return response
}

// Authenticate user
export async function authenticateUser(
  usernameOrEmail: string,
  password: string
): Promise<{ success: boolean; user?: AdminSession; error?: string }> {
  try {
    console.log('[Auth] Looking for user:', usernameOrEmail)
    
    // Find user by username first (priority), then email
    const user = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail }, // Username takes priority
          { email: usernameOrEmail },
        ],
      },
    })

    if (!user) {
      console.log('[Auth] User not found:', usernameOrEmail)
      return { success: false, error: 'Invalid username or password' }
    }

    console.log('[Auth] User found:', user.username, 'Status:', user.status)

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      console.log('[Auth] User is inactive')
      return { success: false, error: 'Account is inactive. Please contact administrator.' }
    }

    // Verify password
    console.log('[Auth] Verifying password...')
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('[Auth] Password mismatch')
      return { success: false, error: 'Invalid username or password' }
    }

    console.log('[Auth] Password verified, creating session')
    // Return session data
    return {
      success: true,
      user: {
        userId: user.id,
        username: user.username,
        fullName: user.fullName,
        userType: user.userType,
      },
    }
  } catch (error: any) {
    console.error('[Auth] Authentication error:', error)
    console.error('[Auth] Error details:', error?.message, error?.stack)
    return { success: false, error: `Authentication failed: ${error?.message || 'Unknown error'}` }
  }
}
