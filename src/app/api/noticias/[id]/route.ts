// src/app/api/noticias/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ✅ INCLUIR las fotos
    const noticia = await prisma.noticia.update({
      where: { id },
      data: { vistas: { increment: 1 } },
      include: {
        fotos: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    // ✅ Transformar para compatibilidad
    const noticiaFormateada = {
      ...noticia,
      imagen: noticia.fotos.length > 0 ? noticia.fotos[0].url : null,
      fotos: noticia.fotos
    }

    return NextResponse.json({
      success: true,
      data: noticiaFormateada
    })

  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Noticia no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al obtener la noticia' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ✅ Obtener noticia con sus fotos
    const noticia = await prisma.noticia.findUnique({
      where: { id },
      include: { fotos: true }
    })

    if (!noticia) {
      return NextResponse.json(
        { success: false, error: 'Noticia no encontrada' },
        { status: 404 }
      )
    }

    // ✅ Eliminar archivos físicos
    for (const foto of noticia.fotos) {
      try {
        const filePath = join(process.cwd(), 'public', foto.url)
        await unlink(filePath)
        console.log(`✅ Eliminado archivo: ${filePath}`)
      } catch (error) {
        console.error(`Error eliminando ${foto.url}:`, error)
      }
    }

    // ✅ Eliminar noticia
    await prisma.noticia.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Noticia eliminada exitosamente'
    })

  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Noticia no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al eliminar la noticia' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { destacada, ...otrosCampos } = body

    if (destacada === true) {
      const noticiaActual = await prisma.noticia.findUnique({
        where: { id }
      })

      if (!noticiaActual) {
        return NextResponse.json(
          { success: false, error: 'Noticia no encontrada' },
          { status: 404 }
        )
      }

      if (!noticiaActual.destacada) {
        const destacadasCount = await prisma.noticia.count({
          where: { destacada: true }
        })
        
        if (destacadasCount >= 10) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'No se puede marcar como destacada. Ya existen 10 noticias destacadas.' 
            },
            { status: 400 }
          )
        }
      }
    }

    const noticiaActualizada = await prisma.noticia.update({
      where: { id },
      data: {
        ...otrosCampos,
        destacada: destacada !== undefined ? destacada : undefined
      }
    })

    return NextResponse.json({
      success: true,
      data: noticiaActualizada,
      message: 'Noticia actualizada exitosamente'
    })

  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Noticia no encontrada' },
        { status: 404 }
      )
    }

    console.error('Error al actualizar noticia:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}