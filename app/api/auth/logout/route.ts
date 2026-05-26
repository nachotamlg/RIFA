import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
  try {
    await clearAuthCookie()
    return NextResponse.json(
      { message: 'Logout exitoso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error en logout:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
