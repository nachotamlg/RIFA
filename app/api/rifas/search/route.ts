import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthToken, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (!query) {
      return NextResponse.json(
        { error: 'Se requiere un término de búsqueda' },
        { status: 400 }
      )
    }

    const results = await prisma.rifa.findMany({
      where: {
        userId: decoded.userId as number,
        numero: {
          contains: query,
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        numero: true,
        descripcion: true,
        estado: true,
        createdAt: true,
      },
    })

    // Mapear campos para que el frontend pueda usarlos
    const mappedResults = results.map(rifa => ({
      id: rifa.id,
      number: rifa.numero,
      numero: rifa.numero,
      description: rifa.descripcion,
      descripcion: rifa.descripcion,
      estado: rifa.estado,
      createdAt: rifa.createdAt,
    }))

    return NextResponse.json(mappedResults, { status: 200 })
  } catch (error) {
    console.error('[v0] Error en búsqueda:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
