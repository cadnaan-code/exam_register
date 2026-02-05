import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/registrations/[id]/reject - Reject registration
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { rejectionReason } = body
    const rejectedBy = body.rejectedBy || 'system' // In real app, get from auth

    if (!rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    const registration = await prisma.specialExamRegistration.update({
      where: { id: params.id },
      data: {
        approvalStatus: 'REJECTED',
        rejectionReason,
        rejectedBy,
        rejectedAt: new Date(),
        approvedBy: null,
        approvedAt: null,
      },
    })

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error rejecting registration:', error)
    return NextResponse.json(
      { error: 'Failed to reject registration' },
      { status: 500 }
    )
  }
}
