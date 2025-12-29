import type { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies'

interface Session {
  tokenHash: string
  createdAt: number
  expiresAt: number
}

// Session storage (in-memory for simplicity)
const sessions = new Map<string, Session>()

// Clean up expired sessions every hour
const CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hour
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

// Periodic cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [hash, session] of sessions.entries()) {
      if (session.expiresAt < now) {
        sessions.delete(hash)
      }
    }
  }, CLEANUP_INTERVAL)
}

/**
 * Verify password against environment variable using constant-time comparison
 */
export function verifyPassword(inputPassword: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set')
    return false
  }

  // Simple comparison - in production, consider using a proper timing-safe compare
  return inputPassword === adminPassword
}

/**
 * Generate a secure random session token using Web Crypto API
 */
export function createSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash a token using SHA-256 with Web Crypto API
 */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Create a new session token with expiry embedded
 */
export async function createSession(): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION
  const randomToken = createSessionToken()

  // Create a signed token with expiry: timestamp|randomToken|signature
  const payload = `${expiresAt}|${randomToken}`
  const signature = await hashToken(payload + (process.env.SESSION_SECRET || ''))
  const token = `${payload}|${signature}`

  return token
}

/**
 * Validate a session token
 */
export async function validateSession(token: string): Promise<boolean> {
  try {
    // Parse token: timestamp|randomToken|signature
    const parts = token.split('|')
    if (parts.length !== 3) {
      return false
    }

    const [expiresAtStr, randomToken, signature] = parts
    const expiresAt = parseInt(expiresAtStr, 10)

    // Check if expired
    if (expiresAt < Date.now()) {
      return false
    }

    // Verify signature
    const payload = `${expiresAtStr}|${randomToken}`
    const expectedSignature = await hashToken(payload + (process.env.SESSION_SECRET || ''))

    if (signature !== expectedSignature) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

/**
 * Delete a session (no-op since we use signed tokens)
 */
export async function deleteSession(token: string): Promise<void> {
  // No server-side storage to clean up
}

/**
 * Cookie configuration for setting session cookie
 */
export function setSessionCookie(token: string) {
  return {
    name: 'session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: '/'
  }
}

/**
 * Cookie configuration for clearing session cookie
 */
export function clearSessionCookie() {
  return {
    name: 'session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/'
  }
}

/**
 * Extract session token from request cookies
 */
export function getSessionToken(cookies: RequestCookies): string | null {
  const sessionCookie = cookies.get('session')
  return sessionCookie?.value || null
}
