// src/app/api/fotos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadImageToR2, deleteImageFromR2 } from '@/lib/r2'

const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
const maxSize = 5 * 1024 * 1024

const getR2KeyFromUrl = (url: string) => {
  if (url.startsWith('/uploads/noticias/')) {
    return `noticias/${url.replace('/uploads/noticias/', '')}`
  }
  if (url.startsWith('noticias/')) {
    return url
  }
  throw new Error('URL de foto no válida para R2: ' + url)
}

// POST - Subir foto
export async function POST(req: NextRequest) {
  console.log('📸 POST /api/fotos - Iniciando...')
  
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const nombre = formData.get('nombre') as string
    const noticiaId = formData.get('noticiaId') as string

    console.log('Datos recibidos:', { 
      tieneFile: !!file, 
      nombreArchivo: file?.name,
      nombre,
      noticiaId 
    })

    if (!file || !nombre || !noticiaId) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Formato no válido. Use JPG, PNG, GIF o WEBP' },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'La imagen no debe superar los 5MB' },
        { status: 400 }
      )
    }

    const noticia = await prisma.noticia.findUnique({
      where: { id: noticiaId },
    })

    if (!noticia) {
      return NextResponse.json(
        { success: false, error: 'Noticia no encontrada' },
        { status: 404 }
      )
    }

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop() ?? 'jpg'
    const fileName = `noticia_${noticiaId}_${timestamp}_${randomString}.${extension}`
    const fileUrl = `/uploads/noticias/${fileName}`

    const buffer = Buffer.from(await file.arrayBuffer())
    await uploadImageToR2(fileName, buffer, file.type)

    const foto = await prisma.noticiaFoto.create({
      data: {
        url: fileUrl,
        nombre,
        noticiaId,
      },
    })

    return NextResponse.json({
      success: true,
      data: foto,
      message: 'Foto subida exitosamente',
    })

  } catch (error) {
    console.error('❌ Error en POST /api/fotos:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

// GET - Obtener fotos de una noticia
export async function GET(req: NextRequest) {
  console.log('📸 GET /api/fotos')
  
  try {
    const searchParams = req.nextUrl.searchParams
    const noticiaId = searchParams.get('noticiaId')

    if (!noticiaId) {
      return NextResponse.json(
        { success: false, error: 'Se requiere noticiaId' },
        { status: 400 }
      )
    }

    const fotos = await prisma.noticiaFoto.findMany({
      where: { noticiaId },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📸 Encontradas ${fotos.length} fotos`)

    return NextResponse.json({
      success: true,
      data: fotos
    })

  } catch (error) {
    console.error('❌ Error en GET /api/fotos:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una foto
export async function DELETE(req: NextRequest) {
  console.log('📸 DELETE /api/fotos')
  
  try {
    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Se requiere id de la foto' },
        { status: 400 }
      )
    }

    const foto = await prisma.noticiaFoto.findUnique({
      where: { id }
    })

    if (!foto) {
      return NextResponse.json(
        { success: false, error: 'Foto no encontrada' },
        { status: 404 }
      )
    }

    try {
      const r2Key = getR2KeyFromUrl(foto.url)
      await deleteImageFromR2(r2Key)
    } catch (error) {
      console.error('❌ Error eliminando imagen en R2:', error)
    }

    await prisma.noticiaFoto.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Foto eliminada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en DELETE /api/fotos:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}