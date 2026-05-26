import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/init-db'

// This API route is called on first request to initialize the database
export async function GET() {
  try {
    await initializeDatabase()
    return NextResponse.json(
      { message: 'Base de datos inicializada correctamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error en inicialización:', error)
    return NextResponse.json(
      { error: 'Error al inicializar la base de datos' },
      { status: 500 }
    )
  }
}
