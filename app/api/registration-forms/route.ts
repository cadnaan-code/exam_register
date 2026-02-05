import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registrationFormSchema } from '@/lib/validations'

// GET /api/registration-forms - Get all forms or by ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const isOpen = searchParams.get('isOpen')

    if (id) {
      const form = await prisma.registrationForm.findUnique({
        where: { id },
        include: {
          _count: {
            select: { registrations: true },
          },
        },
      })
      if (!form) {
        return NextResponse.json({ error: 'Form not found' }, { status: 404 })
      }
      return NextResponse.json({
        id: form.id,
        name: form.formName,
        formName: form.formName,
        description: form.description,
        type: form.formType,
        status: form.isOpen ? 'OPEN' : 'CLOSED',
        link: `${process.env.NEXT_PUBLIC_APP_URL}/register/${form.id}`,
        createdDate: form.createdAt.toISOString().split('T')[0],
        createdAt: form.createdAt.toISOString(),
        createdBy: form.createdBy || 'Admin User',
        totalSubmissions: form._count.registrations,
        activeSubmissions: form._count.registrations,
        startDate: form.startDate?.toISOString().split('T')[0] || '',
        endDate: form.endDate?.toISOString().split('T')[0] || null,
        isOpen: form.isOpen,
      })
    }

    const where: any = {}
    if (isOpen !== null) {
      where.isOpen = isOpen === 'true'
    }

    const forms = await prisma.registrationForm.findMany({
      where,
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform to match UI format
    const transformed = forms.map((form) => ({
      id: form.id,
      name: form.formName,
      formName: form.formName,
      description: form.description,
      type: form.formType,
      status: form.isOpen ? 'OPEN' : 'CLOSED',
      link: `${process.env.NEXT_PUBLIC_APP_URL}/register/${form.id}`,
      createdDate: form.createdAt.toISOString().split('T')[0],
      createdAt: form.createdAt.toISOString(),
      createdBy: form.createdBy || 'Admin User',
      totalSubmissions: form._count.registrations,
      activeSubmissions: form._count.registrations, // Can be filtered by status later
      startDate: form.startDate?.toISOString().split('T')[0] || '',
      endDate: form.endDate?.toISOString().split('T')[0] || null,
      isOpen: form.isOpen,
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching registration forms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registration forms' },
      { status: 500 }
    )
  }
}

// POST /api/registration-forms - Create new form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = registrationFormSchema.parse(body)

    // Map UI type to enum
    const typeMap: Record<string, 'SPECIAL_EXAM' | 'CLEARANCE_EXAM' | 'ADMINISTRATIVE' | 'RESIT_EXAM' | 'IMPROVEMENT_EXAM'> = {
      'Special Exam': 'SPECIAL_EXAM',
      'Clearance Exam': 'CLEARANCE_EXAM',
      'Administrative': 'ADMINISTRATIVE',
      'Resit Exam': 'RESIT_EXAM',
      'Improvement Exam': 'IMPROVEMENT_EXAM',
    }

    const form = await prisma.registrationForm.create({
      data: {
        formName: validated.name,
        description: validated.description,
        formType: typeMap[validated.type],
        isOpen: true,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        createdBy: body.createdBy || null,
      },
    })

    return NextResponse.json(
      {
        id: form.id,
        name: form.formName,
        description: form.description,
        type: form.formType,
        status: form.isOpen ? 'OPEN' : 'CLOSED',
        link: `${process.env.NEXT_PUBLIC_APP_URL}/register/${form.id}`,
        createdDate: form.createdAt.toISOString().split('T')[0],
        createdBy: form.createdBy || 'Admin User',
        totalSubmissions: 0,
        activeSubmissions: 0,
        startDate: form.startDate?.toISOString().split('T')[0] || '',
        endDate: form.endDate?.toISOString().split('T')[0] || '',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      )
    }
    console.error('Error creating registration form:', error)
    return NextResponse.json(
      { error: 'Failed to create registration form' },
      { status: 500 }
    )
  }
}

// PATCH /api/registration-forms - Update form (toggle open/close, edit)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isOpen, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      )
    }

    const updatePayload: any = {}
    if (isOpen !== undefined) {
      updatePayload.isOpen = isOpen
    }
    if (updateData.name) {
      updatePayload.formName = updateData.name
    }
    if (updateData.description !== undefined) {
      updatePayload.description = updateData.description
    }
    if (updateData.type) {
      const typeMap: Record<string, 'SPECIAL_EXAM' | 'CLEARANCE_EXAM' | 'ADMINISTRATIVE' | 'RESIT_EXAM' | 'IMPROVEMENT_EXAM'> = {
        'Special Exam': 'SPECIAL_EXAM',
        'Clearance Exam': 'CLEARANCE_EXAM',
        'Administrative': 'ADMINISTRATIVE',
        'Resit Exam': 'RESIT_EXAM',
        'Improvement Exam': 'IMPROVEMENT_EXAM',
      }
      updatePayload.formType = typeMap[updateData.type]
    }
    if (updateData.startDate) {
      updatePayload.startDate = new Date(updateData.startDate)
    }
    if (updateData.endDate) {
      updatePayload.endDate = new Date(updateData.endDate)
    }

    const form = await prisma.registrationForm.update({
      where: { id },
      data: updatePayload,
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    })

    return NextResponse.json({
      id: form.id,
      name: form.formName,
      description: form.description,
      type: form.formType,
      status: form.isOpen ? 'OPEN' : 'CLOSED',
      link: `${process.env.NEXT_PUBLIC_APP_URL}/register/${form.id}`,
      createdDate: form.createdAt.toISOString().split('T')[0],
      createdBy: form.createdBy || 'Admin User',
      totalSubmissions: form._count.registrations,
      activeSubmissions: form._count.registrations,
      startDate: form.startDate?.toISOString().split('T')[0] || '',
      endDate: form.endDate?.toISOString().split('T')[0] || '',
    })
  } catch (error) {
    console.error('Error updating registration form:', error)
    return NextResponse.json(
      { error: 'Failed to update registration form' },
      { status: 500 }
    )
  }
}

// DELETE /api/registration-forms - Delete form
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      )
    }

    await prisma.registrationForm.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting registration form:', error)
    return NextResponse.json(
      { error: 'Failed to delete registration form' },
      { status: 500 }
    )
  }
}
