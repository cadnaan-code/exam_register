import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminUserSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'
import { ZodError } from 'zod'

// GET /api/admin-users - Get all admin users
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where: any = {}
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (type && type !== 'ALL') {
      where.userType = type.toUpperCase()
    }
    if (status && status !== 'ALL') {
      where.status = status.toUpperCase()
    }

    const users = await prisma.adminUser.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phone: true,
        userType: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform to match UI format
    const transformed = users.map((user) => {
      const initials = user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email || `${user.username}@siu.edu.so`,
        username: user.username,
        phone: user.phone || '+252 61 XXX XXXX',
        userType: user.userType,
        status: user.status === 'ACTIVE' ? 'Active' : 'Inactive',
        avatarColor: 'bg-gray-500', // Can be calculated based on index
        initials,
      }
    })

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin users' },
      { status: 500 }
    )
  }
}

// POST /api/admin-users - Create new admin user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = adminUserSchema.parse(body)

    // Hash password (required field)
    if (!validated.password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }
    const hashedPassword = await bcrypt.hash(validated.password, 10)

    // Map UI values to enums
    const typeMap: Record<string, 'ADMIN' | 'DEAN' | 'HOD' | 'USER'> = {
      Admin: 'ADMIN',
      Dean: 'DEAN',
      HOD: 'HOD',
      User: 'USER',
    }

    const statusMap: Record<string, 'ACTIVE' | 'INACTIVE'> = {
      Active: 'ACTIVE',
      Inactive: 'INACTIVE',
    }

    const user = await prisma.adminUser.create({
      data: {
        fullName: validated.fullName,
        username: validated.username,
        password: hashedPassword,
        email: `${validated.username}@siu.edu.so`,
        userType: typeMap[validated.type],
        status: statusMap[validated.status],
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phone: true,
        userType: true,
        status: true,
      },
    })

    return NextResponse.json(
      {
        id: user.id,
        fullName: user.fullName,
        email: user.email || `${user.username}@siu.edu.so`,
        username: user.username,
        phone: user.phone || '+252 61 XXX XXXX',
        userType: user.userType,
        status: user.status === 'ACTIVE' ? 'Active' : 'Inactive',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating admin user:', error)
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json(
        { error: 'Validation error', details: errorMessages },
        { status: 400 }
      )
    }
    
    // Handle Prisma unique constraint errors (duplicate username/email)
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field'
      return NextResponse.json(
        { error: `${field === 'username' ? 'Username' : 'Email'} already exists` },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create admin user' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin-users - Update admin user
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const updatePayload: any = {}
    if (updateData.fullName) {
      updatePayload.fullName = updateData.fullName
    }
    if (updateData.username) {
      updatePayload.username = updateData.username
    }
    if (updateData.password) {
      updatePayload.password = await bcrypt.hash(updateData.password, 10)
    }
    if (updateData.type) {
      const typeMap: Record<string, 'ADMIN' | 'DEAN' | 'HOD' | 'USER'> = {
        Admin: 'ADMIN',
        Dean: 'DEAN',
        HOD: 'HOD',
        User: 'USER',
      }
      updatePayload.userType = typeMap[updateData.type]
    }
    if (updateData.status) {
      const statusMap: Record<string, 'ACTIVE' | 'INACTIVE'> = {
        Active: 'ACTIVE',
        Inactive: 'INACTIVE',
      }
      updatePayload.status = statusMap[updateData.status]
    }

    const user = await prisma.adminUser.update({
      where: { id },
      data: updatePayload,
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phone: true,
        userType: true,
        status: true,
      },
    })

    return NextResponse.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email || `${user.username}@siu.edu.so`,
      username: user.username,
      phone: user.phone || '+252 61 XXX XXXX',
      userType: user.userType,
      status: user.status === 'ACTIVE' ? 'Active' : 'Inactive',
    })
  } catch (error) {
    console.error('Error updating admin user:', error)
    return NextResponse.json(
      { error: 'Failed to update admin user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin-users - Delete admin user
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await prisma.adminUser.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin user:', error)
    return NextResponse.json(
      { error: 'Failed to delete admin user' },
      { status: 500 }
    )
  }
}
