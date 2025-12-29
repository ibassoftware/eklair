import { NextRequest, NextResponse } from 'next/server'
import { getSessionToken, deleteSession, clearSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = getSessionToken(request.cookies)

    if (token) {
      await deleteSession(token)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(clearSessionCookie())

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
