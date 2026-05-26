import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email o contraseña inválidos' },
        { status: 401 }
      )
    }

    const passwordMatch = await verifyPassword(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email o contraseña inválidos' },
        { status: 401 }
      )
    }

    const token = await createToken(user.id, user.email)

    const response = NextResponse.json(
      { message: 'Login exitoso', userId: user.id, email: user.email },
      { status: 200 }
    )

    await setAuthCookie(token)
    return response
  } catch (error) {
    console.error('[v0] Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
