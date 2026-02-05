import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registrationSchema } from '@/lib/validations'

// GET /api/registrations - Get all registrations (admin view)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const formId = searchParams.get('formId')
    const studentId = searchParams.get('studentId')

    const where: any = {}
    if (status) {
      where.approvalStatus = status.toUpperCase()
    }
    if (formId) {
      where.registrationFormId = formId
    }
    if (studentId) {
      where.studentId = studentId
    }

    const registrations = await prisma.specialExamRegistration.findMany({
      where,
      include: {
        registrationForm: true, // Include ALL form fields
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get all unique studentIds
    const studentIds = [...new Set(registrations.map(reg => reg.studentId))]
    
    // Fetch all students in one query with all fields
    const students = await prisma.student.findMany({
      where: {
        studentId: { in: studentIds },
      },
    })
    
    // Fetch classes for students
    const classIds = [...new Set(students.filter(s => s.classId).map(s => s.classId!))]
    const classes = classIds.length > 0 ? await prisma.class.findMany({
      where: { id: { in: classIds } },
      include: { department: true },
    }) : []
    const classMap = new Map(classes.map(c => [c.id, c]))

    // Create a map for quick student lookup
    const studentMap = new Map(students.map(s => [s.studentId, s]))

    // Transform to include ALL database fields
    const transformed = registrations.map((reg) => {
      const student = studentMap.get(reg.studentId)
      const studentClass = student?.classId ? classMap.get(student.classId) : null
      
      return {
        // Registration fields (ALL)
        id: reg.id,
        registrationFormId: reg.registrationFormId,
        studentId: reg.studentId,
        examScope: reg.examScope,
        courseName: reg.courseName,
        examType: reg.examType,
        reason: reg.reason,
        documentUrl: reg.documentUrl,
        approvalStatus: reg.approvalStatus,
        rejectionReason: reg.rejectionReason,
        approvedBy: reg.approvedBy,
        approvedAt: reg.approvedAt?.toISOString() || null,
        rejectedBy: reg.rejectedBy,
        rejectedAt: reg.rejectedAt?.toISOString() || null,
        createdAt: reg.createdAt.toISOString(),
        updatedAt: reg.updatedAt.toISOString(),
        
        // Registration Form fields (ALL)
        formName: reg.registrationForm.formName,
        formType: reg.registrationForm.formType,
        formDescription: reg.registrationForm.description || null,
        formIsOpen: reg.registrationForm.isOpen,
        formStartDate: reg.registrationForm.startDate?.toISOString() || null,
        formEndDate: reg.registrationForm.endDate?.toISOString() || null,
        formCreatedAt: reg.registrationForm.createdAt.toISOString(),
        formUpdatedAt: reg.registrationForm.updatedAt.toISOString(),
        formCreatedBy: reg.registrationForm.createdBy || null,
        
        // Student fields (ALL)
        studentFullName: student?.fullName || null,
        studentDepartment: student?.department || null,
        studentClassId: student?.classId || null,
        studentClassName: studentClass?.classTitle || null,
        studentClassDepartment: studentClass?.department?.name || null,
        studentSemester: student?.semester || null,
        studentShift: student?.shift || null,
        studentCreatedAt: student?.createdAt?.toISOString() || null,
        studentUpdatedAt: student?.updatedAt?.toISOString() || null,
        
        // For UI compatibility (keep existing structure)
        student: student ? {
          fullName: student.fullName,
          department: student.department,
          semester: student.semester,
          shift: student.shift,
        } : null,
      }
    })

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

// POST /api/registrations - Create new registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate registration form is open
    const form = await prisma.registrationForm.findUnique({
      where: { id: body.registrationFormId },
    })

    if (!form) {
      return NextResponse.json(
        { error: 'Registration form not found' },
        { status: 404 }
      )
    }

    if (!form.isOpen) {
      return NextResponse.json(
        { error: 'Registration is currently closed' },
        { status: 403 }
      )
    }

    // Check if student has already registered for this form
    const existingRegistration = await prisma.specialExamRegistration.findFirst({
      where: {
        studentId: body.studentId,
        registrationFormId: body.registrationFormId,
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You have already registered for this exam. Each student can only register once per form.' },
        { status: 409 }
      )
    }

    // Handle multiple courses if examScope is SPECIFIC
    if (body.examScope === 'specific' && body.courses && Array.isArray(body.courses)) {
      // Create one registration per course
      const registrations = await Promise.all(
        body.courses.map((course: { name: string; examType: string }) => {
          const examScopeMap: Record<string, 'ALL_MIDTERM' | 'ALL_FINAL' | 'SPECIFIC'> = {
            'all-midterm': 'ALL_MIDTERM',
            'all-final': 'ALL_FINAL',
            'specific': 'SPECIFIC',
          }

          const examTypeMap: Record<string, 'MIDTERM' | 'FINAL'> = {
            Midterm: 'MIDTERM',
            Final: 'FINAL',
          }

          return prisma.specialExamRegistration.create({
            data: {
              registrationFormId: body.registrationFormId,
              studentId: body.studentId,
              examScope: examScopeMap[body.examScope] || 'SPECIFIC',
              courseName: course.name,
              examType: examTypeMap[course.examType] || null,
              reason: body.reason,
              documentUrl: body.documentUrl || null,
              approvalStatus: 'PENDING',
            },
          })
        })
      )

      return NextResponse.json(registrations, { status: 201 })
    } else {
      // Single registration for ALL_MIDTERM or ALL_FINAL
      const examScopeMap: Record<string, 'ALL_MIDTERM' | 'ALL_FINAL' | 'SPECIFIC'> = {
        'all-midterm': 'ALL_MIDTERM',
        'all-final': 'ALL_FINAL',
        'specific': 'SPECIFIC',
      }

      // Determine courseName and examType based on examScope
      let courseName: string | null = null
      let examType: 'MIDTERM' | 'FINAL' | null = null

      if (body.examScope === 'all-midterm') {
        courseName = 'ALL_MIDTERMS'
        examType = 'MIDTERM'
      } else if (body.examScope === 'all-final') {
        courseName = 'ALL_FINALS'
        examType = 'FINAL'
      }

      const registration = await prisma.specialExamRegistration.create({
        data: {
          registrationFormId: body.registrationFormId,
          studentId: body.studentId,
          examScope: examScopeMap[body.examScope] || 'SPECIFIC',
          courseName: courseName,
          examType: examType,
          reason: body.reason,
          documentUrl: body.documentUrl || null,
          approvalStatus: 'PENDING',
        },
      })

      return NextResponse.json(registration, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating registration:', error)
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    )
  }
}
