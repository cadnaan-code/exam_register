import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/registration-forms/[formId]/status - Check if form is open
export async function GET(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const form = await prisma.registrationForm.findUnique({
      where: { id: params.formId },
      select: { id: true, formName: true, isOpen: true },
    })

    if (!form) {
      return NextResponse.json(
        { status: 'CLOSED', error: 'Form not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: form.isOpen ? 'OPEN' : 'CLOSED',
      name: form.formName,
    })
  } catch (error) {
    console.error('Error checking form status:', error)
    return NextResponse.json(
      { status: 'CLOSED', error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
