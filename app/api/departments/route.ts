import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
})

// GET /api/departments - Get all departments
export async function GET(request: NextRequest) {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { classes: true },
        },
      },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

// POST /api/departments - Create new department
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = departmentSchema.parse(body)

    // Check if department already exists
    const existing = await prisma.department.findUnique({
      where: { name: validated.name },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Department already exists' },
        { status: 400 }
      )
    }

    const department = await prisma.department.create({
      data: {
        name: validated.name,
      },
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Error creating department:', error)
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    )
  }
}

// PATCH /api/departments - Update department
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      )
    }

    const validated = departmentSchema.parse(updateData)

    // Check if another department with the same name exists
    const existing = await prisma.department.findFirst({
      where: {
        name: validated.name,
        id: { not: id },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Department name already exists' },
        { status: 400 }
      )
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        name: validated.name,
      },
    })

    return NextResponse.json(department)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Error updating department:', error)
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    )
  }
}

// DELETE /api/departments - Delete department
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      )
    }

    // Check if department has classes
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { classes: true },
        },
      },
    })

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    if (department._count.classes > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department with existing classes. Please delete or reassign classes first.' },
        { status: 400 }
      )
    }

    await prisma.department.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Department deleted successfully' })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    )
  }
}
