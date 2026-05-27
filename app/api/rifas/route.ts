import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthToken, verifyToken } from '@/lib/auth'

// GET - Listar todos los números de rifa del usuario
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

    const rifas = await prisma.rifa.findMany({
      where: { userId: decoded.userId as number },
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
    const mappedRifas = rifas.map(rifa => ({
      id: rifa.id,
      number: rifa.numero,
      numero: rifa.numero,
      description: rifa.descripcion,
      descripcion: rifa.descripcion,
      estado: rifa.estado,
      createdAt: rifa.createdAt,
    }))

    return NextResponse.json(mappedRifas, { status: 200 })
  } catch (error) {
    console.error('[v0] Error en GET rifas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo número de rifa
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    // Soportar ambos nombres de campos (numero/number, descripcion/description)
    const numero = body.numero || body.number
    const descripcion = body.descripcion || body.description

    if (!numero) {
      return NextResponse.json(
        { error: 'El número es requerido' },
        { status: 400 }
      )
    }

    // Verificar si el número ya existe para este usuario
    const existing = await prisma.rifa.findFirst({
      where: {
        userId: decoded.userId as number,
        numero,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Este número ya existe' },
        { status: 400 }
      )
    }

    const rifa = await prisma.rifa.create({
      data: {
        numero,
        descripcion: descripcion || null,
        userId: decoded.userId as number,
        estado: 'activo',
      },
    })

    return NextResponse.json(
      { message: 'Número de rifa creado exitosamente', id: rifa.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Error en POST rifa:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
