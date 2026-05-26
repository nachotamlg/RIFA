import bcryptjs from 'bcryptjs'
import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

export async function hashPassword(password: string) {
  return bcryptjs.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcryptjs.compare(password, hashedPassword)
}

export async function createToken(userId: number, email: string) {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret)
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload as { userId: number; email: string }
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60,
  })
}

export async function getAuthToken() {
  const cookieStore = await cookies()
  return cookieStore.get('auth_token')?.value
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
}

export async function getSession() {
  const token = await getAuthToken()
  if (!token) return null
  return verifyToken(token)
}
