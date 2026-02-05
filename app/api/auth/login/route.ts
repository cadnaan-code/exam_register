import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, setSessionCookie } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    console.log('[Login API] Attempting login for:', username)

    if (!username || !password) {
      console.log('[Login API] Missing credentials')
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Authenticate user
    const result = await authenticateUser(username, password)
    console.log('[Login API] Authentication result:', result.success ? 'SUCCESS' : 'FAILED', result.error || '')

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create response with session cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: result.user.userId,
          username: result.user.username,
          fullName: result.user.fullName,
          userType: result.user.userType,
        },
      },
      { status: 200 }
    )

    // Set session cookie
    setSessionCookie(response, result.user)
    console.log('[Login API] Session cookie set successfully')

    return response
  } catch (error: any) {
    console.error('[Login API] Error:', error)
    console.error('[Login API] Error details:', error?.message, error?.stack)
    return NextResponse.json(
      { 
        error: 'Login failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}
