import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  const session = await getSession(request)
  
  if (!session) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    user: {
      id: session.userId,
      username: session.username,
      fullName: session.fullName,
      userType: session.userType,
    },
  })
}
