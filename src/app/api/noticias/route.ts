import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  console.log('🟢 GET /api/noticias')
  
  try {
    const searchParams = request.nextUrl.searchParams
    const categoria = searchParams.get('categoria')
    const destacada = searchParams.get('destacada')
    const busqueda = searchParams.get('busqueda')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: Prisma.NoticiaWhereInput = {}

    if (categoria && categoria !== 'todas') {
      where.categoria = categoria
    }

    if (destacada === 'true') {
      where.destacada = true
    }

    if (busqueda && busqueda.trim() !== '') {
      where.OR = [
        { titulo: { contains: busqueda, mode: 'insensitive' } },
        { resumen: { contains: busqueda, mode: 'insensitive' } },
        { contenido: { contains: busqueda, mode: 'insensitive' } }
      ]
    }

    // ✅ INCLUIR las fotos en la consulta
    const [noticias, total] = await Promise.all([
      prisma.noticia.findMany({
        where,
        skip,
        take: limit,
        include: {
          fotos: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: [
          { destacada: 'desc' },
          { fecha: 'desc' }
        ],
      }),
      prisma.noticia.count({ where })
    ])

    // ✅ Transformar para mantener compatibilidad con el frontend
    const noticiasFormateadas = noticias.map(noticia => ({
      ...noticia,
      imagen: noticia.fotos.length > 0 ? noticia.fotos[0].url : null,
      fotos: noticia.fotos
    }))

    return NextResponse.json({
      success: true,
      data: noticiasFormateadas,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })

  } catch (error) {
    console.error('Error GET /api/noticias:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener las noticias' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('🟡 POST /api/noticias')
  
  try {
    const body = await request.json()
    const {
      titulo,
      resumen,
      contenido,
      categoria,
      autor,
      destacada = false,
      colorTexto = '#ffffff'
      // ❌ ELIMINADO: imagen
    } = body

    console.log('📝 Datos recibidos:', { titulo, resumen, categoria, autor })

    // Validaciones
    if (!titulo || titulo.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'El título debe tener al menos 5 caracteres' },
        { status: 400 }
      )
    }

    if (!resumen || resumen.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'El resumen debe tener al menos 10 caracteres' },
        { status: 400 }
      )
    }

    if (!autor || autor.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El autor es obligatorio' },
        { status: 400 }
      )
    }

    // ❌ ELIMINADA la validación de imagen

    // Validar límite de destacadas
    if (destacada === true) {
      const destacadasCount = await prisma.noticia.count({
        where: { destacada: true }
      })
      
      if (destacadasCount >= 10) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'No se puede marcar como destacada. Ya existen 10 noticias destacadas. Desmarca alguna primero.' 
          },
          { status: 400 }
        )
      }
    }

    // ✅ Crear noticia SIN el campo imagen
    const nuevaNoticia = await prisma.noticia.create({
      data: {
        titulo: titulo.trim(),
        resumen: resumen.trim(),
        contenido,
        categoria,
        autor: autor.trim(),
        destacada,
        colorTexto,
        vistas: 0,
        fecha: new Date()
        // ❌ NO incluir campo imagen
      }
    })

    console.log('✅ Noticia creada:', nuevaNoticia.id)

    return NextResponse.json({
      success: true,
      data: nuevaNoticia,
      message: 'Noticia creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error POST /api/noticias:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear la noticia' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  console.log('🔴 DELETE /api/noticias')
  
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de noticia no proporcionado' },
        { status: 400 }
      )
    }
    
    // ✅ Obtener la noticia con sus fotos
    const noticiaExistente = await prisma.noticia.findUnique({
      where: { id },
      include: { fotos: true }
    })
    
    if (!noticiaExistente) {
      return NextResponse.json(
        { success: false, error: 'Noticia no encontrada' },
        { status: 404 }
      )
    }
    
    // ✅ Eliminar archivos físicos de las fotos
    for (const foto of noticiaExistente.fotos) {
      try {
        const filePath = join(process.cwd(), 'public', foto.url)
        await unlink(filePath)
        console.log(`✅ Eliminado archivo: ${filePath}`)
      } catch (error) {
        console.error(`Error eliminando archivo ${foto.url}:`, error)
      }
    }
    
    // ✅ Eliminar la noticia (las fotos se eliminan por CASCADE)
    await prisma.noticia.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Noticia eliminada exitosamente'
    })
    
  } catch (error) {
    console.error('Error DELETE /api/noticias:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar la noticia' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  console.log('🟠 PUT /api/noticias')
  
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const body = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de noticia no proporcionado' },
        { status: 400 }
      )
    }
    
    const { destacada } = body
    
    // Si se está marcando como destacada, verificar límite
    if (destacada === true) {
      const destacadasCount = await prisma.noticia.count({
        where: { destacada: true, id: { not: id } }
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
    
    const noticiaActualizada = await prisma.noticia.update({
      where: { id },
      data: body
    })
    
    return NextResponse.json({
      success: true,
      data: noticiaActualizada,
      message: 'Noticia actualizada exitosamente'
    })
    
  } catch (error) {
    console.error('Error PUT /api/noticias:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar la noticia' },
      { status: 500 }
    )
  }
}