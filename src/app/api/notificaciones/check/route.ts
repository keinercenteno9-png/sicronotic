// src/app/api/notificaciones/check/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Esta API se llamará periódicamente desde el frontend
export async function GET() {
  try {
    const ahora = new Date()
    const horaActual = ahora.getHours().toString().padStart(2, '0')
    const minutosActual = ahora.getMinutes().toString().padStart(2, '0')
    const horaActualStr = `${horaActual}:${minutosActual}`
    
    // Buscar eventos que:
    // 1. Tienen notificar = true
    // 2. Son hoy
    // 3. La hora de inicio está entre ahora y ahora + 5 minutos
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const manana = new Date(hoy)
    manana.setDate(manana.getDate() + 1)
    
    const eventos = await prisma.evento.findMany({
      where: {
        notificar: true,
        fecha: {
          gte: hoy,
          lt: manana
        }
      }
    })
    
    // Filtrar eventos que están por comenzar (próximos 5 minutos)
    const eventosPorNotificar = eventos.filter(evento => {
      const [horaEvento, minEvento] = evento.horaInicio.split(':').map(Number)
      const horaNotificacion = new Date()
      horaNotificacion.setHours(horaEvento, minEvento, 0)
      
      const diferencia = horaNotificacion.getTime() - ahora.getTime()
      // Notificar si faltan entre 0 y 5 minutos
      return diferencia >= 0 && diferencia <= 5 * 60 * 1000
    })
    
    return NextResponse.json({
      success: true,
      eventos: eventosPorNotificar.map(e => ({
        id: e.id,
        titulo: e.titulo,
        horaInicio: e.horaInicio
      }))
    })
    
  } catch (error) {
    console.error('Error checking notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar notificaciones' },
      { status: 500 }
    )
  }
}