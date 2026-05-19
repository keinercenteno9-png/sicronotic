// src/app/api/eventos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los eventos
export async function GET(request: NextRequest) {
  console.log('🟢 GET /api/eventos')
  
  try {
    const searchParams = request.nextUrl.searchParams
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    
    const where: Prisma.EventoWhereInput = {}
    
    if (fechaInicio && fechaFin) {
      where.fecha = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin)
      }
    }
    
    const eventos = await prisma.evento.findMany({
      where,
      include: {
        invitados: true
      },
      orderBy: {
        fecha: 'asc'
      }
    })
    
    console.log(`✅ GET exitoso: ${eventos.length} eventos encontrados`)
    
    const eventosSerializados = eventos.map(evento => ({
      ...evento,
      fecha: evento.fecha.toISOString(),
      createdAt: evento.createdAt.toISOString(),
      updatedAt: evento.updatedAt.toISOString()
    }))
    
    return NextResponse.json({
      success: true,
      data: eventosSerializados
    })
    
  } catch (error) {
    console.error('❌ Error GET /api/eventos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener eventos' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo evento
export async function POST(request: NextRequest) {
  console.log('🟡 POST /api/eventos - INICIANDO')
  
  try {
    const body = await request.json()
    console.log('📦 Body recibido:', JSON.stringify(body, null, 2))
    
    const {
      titulo,
      fecha,
      horaInicio,
      horaFin,
      ubicacion,
      descripcion,
      notificar,
      color,
      textColor,
      bold,
      italic,
      underline,
      textAlign,
      icono,
      invitados = []
    } = body
    
    // Validaciones
    if (!titulo) {
      return NextResponse.json(
        { success: false, error: 'El título es obligatorio' },
        { status: 400 }
      )
    }
    
    if (!fecha) {
      return NextResponse.json(
        { success: false, error: 'La fecha es obligatoria' },
        { status: 400 }
      )
    }
    
    const fechaDate = new Date(fecha)
    if (isNaN(fechaDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'La fecha no es válida' },
        { status: 400 }
      )
    }
    
    // Crear evento
    const nuevoEvento = await prisma.evento.create({
      data: {
        titulo,
        fecha: fechaDate,
        horaInicio: horaInicio || '09:00',
        horaFin: horaFin || '10:00',
        ubicacion: ubicacion || null,
        descripcion: descripcion || null,
        notificar: notificar || false,
        color: color || '#FFFFFF',
        textColor: textColor || '#000000',
        bold: bold || false,
        italic: italic || false,
        underline: underline || false,
        textAlign: textAlign || 'left',
        icono: icono || null,
        invitados: {
          create: invitados.map((nombre: string) => ({
            nombre: nombre.trim(),
            email: null,
            confirmado: false
          }))
        }
      },
      include: {
        invitados: true
      }
    })
    
    console.log(`✅ Evento creado: ${nuevoEvento.id}`)
    
    return NextResponse.json({
      success: true,
      data: {
        ...nuevoEvento,
        fecha: nuevoEvento.fecha.toISOString(),
        createdAt: nuevoEvento.createdAt.toISOString(),
        updatedAt: nuevoEvento.updatedAt.toISOString()
      },
      message: 'Evento creado exitosamente'
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Error POST /api/eventos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear evento',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}