import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/registrations/[id]/approve - Approve registration
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const approvedBy = body.approvedBy || 'system' // In real app, get from auth

    const registration = await prisma.specialExamRegistration.update({
      where: { id: params.id },
      data: {
        approvalStatus: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
        rejectionReason: null,
        rejectedBy: null,
        rejectedAt: null,
      },
    })

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error approving registration:', error)
    return NextResponse.json(
      { error: 'Failed to approve registration' },
      { status: 500 }
    )
  }
}
