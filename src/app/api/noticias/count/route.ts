// src/app/api/noticias/count/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const destacadas = searchParams.get('destacadas') === 'true'
    
    if (destacadas) {
      const count = await prisma.noticia.count({
        where: { destacada: true }
      })
      return NextResponse.json({ success: true, count, maxLimit: 10 })
    }
    
    const total = await prisma.noticia.count()
    return NextResponse.json({ success: true, count: total })
  } catch (error) {
    console.error('Error al contar noticias:', error)
    return NextResponse.json(
      { success: false, error: 'Error al contar noticias' },
      { status: 500 }
    )
  }
}