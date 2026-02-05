import { NextRequest, NextResponse } from 'next/server'
import { getSession } from './auth-server'

// Middleware helper to protect API routes
export async function requireAuth(request: NextRequest): Promise<{ 
  success: true; 
  session: any 
} | { 
  success: false; 
  response: NextResponse 
}> {
  const session = await getSession(request)
  
  if (!session) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }

  return { success: true, session }
}
