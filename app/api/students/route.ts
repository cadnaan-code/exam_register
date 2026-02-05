import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { studentSchema } from '@/lib/validations'

// GET /api/students - Get all students or search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('studentId')
    const search = searchParams.get('search')

    if (studentId) {
      const student = await prisma.student.findUnique({
        where: { studentId },
        include: {
          registrations: {
            include: {
              registrationForm: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      })
      return NextResponse.json(student)
    }

    const students = await prisma.student.findMany({
      where: search
        ? {
            OR: [
              { studentId: { contains: search, mode: 'insensitive' } },
              { fullName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      include: {
        registrations: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// POST /api/students - Create or update student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = studentSchema.parse(body)

    // Map UI shift values to Prisma enum values
    // UI sends: 'fulltime' or 'parttime' (lowercase, no underscore)
    // Prisma enum expects: 'FULL_TIME' or 'PART_TIME' (uppercase, with underscore)
    const shiftMap: Record<string, 'FULL_TIME' | 'PART_TIME'> = {
      fulltime: 'FULL_TIME',
      parttime: 'PART_TIME',
    }

    const shiftValue = shiftMap[validated.shift] as 'FULL_TIME' | 'PART_TIME'
    if (!shiftValue) {
      return NextResponse.json(
        { error: `Invalid shift value: ${validated.shift}. Must be 'fulltime' or 'parttime'` },
        { status: 400 }
      )
    }

    // Department comes directly from class selection (already in correct format)
    // If it's still in old format (computer-science), map it, otherwise use as-is
    const departmentMap: Record<string, string> = {
      'computer-science': 'Computer Science',
      'civil-engineering': 'Civil Engineering',
    }
    const departmentName = departmentMap[validated.department] || validated.department

    console.log('[Students API] Creating/updating student:', {
      studentId: validated.studentId,
      fullName: validated.fullName,
      department: validated.department,
      departmentName,
      classId: validated.classId,
      semester: validated.semester,
      shift: validated.shift,
      shiftMapped: shiftValue,
    })

    // Upsert: update if exists, create if not
    // shiftValue is now properly typed as 'FULL_TIME' | 'PART_TIME' matching Prisma enum
    const student = await prisma.student.upsert({
      where: { studentId: validated.studentId },
      update: {
        fullName: validated.fullName,
        department: departmentName,
        classId: validated.classId,
        semester: validated.semester,
        shift: shiftValue, // Properly typed enum value
      },
      create: {
        studentId: validated.studentId,
        fullName: validated.fullName,
        department: departmentName,
        classId: validated.classId,
        semester: validated.semester,
        shift: shiftValue, // Properly typed enum value
      },
    })

    console.log('[Students API] Student saved successfully:', student.id)

    return NextResponse.json(student, { status: 201 })
  } catch (error: any) {
    console.error('[Students API] Error creating/updating student:', error)
    console.error('[Students API] Error details:', {
      name: error?.name,
      code: error?.code,
      message: error?.message,
      meta: error?.meta,
    })
    
    if (error?.name === 'ZodError') {
      const errorMessages = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json(
        { error: 'Validation error', details: errorMessages },
        { status: 400 }
      )
    }
    
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Student ID already exists' },
        { status: 409 }
      )
    }

    // Check for enum mismatch error (common when database enum doesn't match schema)
    if (error?.message?.includes('Invalid enum value') || 
        error?.message?.includes('Unknown arg `shift`') ||
        error?.code === 'P2003') {
      return NextResponse.json(
        { 
          error: 'Database enum mismatch. The Shift enum needs to be updated.',
          details: 'Please run: npx prisma db push (or npx prisma migrate dev) to update the database schema.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: `Failed to create/update student: ${error?.message || 'Unknown error'}`,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}
