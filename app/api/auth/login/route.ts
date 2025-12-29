import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Verify password
    if (!verifyPassword(password)) {
      // Add small delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000))
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create session
    const token = await createSession()

    // Set cookie and return success
    const response = NextResponse.json({ success: true })
    response.cookies.set(setSessionCookie(token))

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
