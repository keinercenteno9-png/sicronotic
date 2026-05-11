// src/app/api/fotos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'  // ✅ IMPORTAR LA INSTANCIA EXISTENTE

// ❌ ELIMINA ESTA LÍNEA: const prisma = new PrismaClient();

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

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Formato no válido. Use JPG, PNG, GIF o WEBP' },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'La imagen no debe superar los 5MB' },
        { status: 400 }
      )
    }

    // Verificar que la noticia existe
    const noticia = await prisma.noticia.findUnique({
      where: { id: noticiaId }
    })

    if (!noticia) {
      console.log('❌ Noticia no encontrada:', noticiaId)
      return NextResponse.json(
        { success: false, error: 'Noticia no encontrada' },
        { status: 404 }
      )
    }

    // Crear directorio
    const uploadsDir = join(process.cwd(), 'public/uploads/noticias')
    if (!existsSync(uploadsDir)) {
      console.log('📁 Creando directorio:', uploadsDir)
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generar nombre único
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const fileName = `noticia_${noticiaId}_${timestamp}_${randomString}.${extension}`
    const filePath = join(uploadsDir, fileName)

    console.log('📁 Guardando archivo:', filePath)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    console.log('✅ Archivo guardado correctamente')

    const foto = await prisma.noticiaFoto.create({
      data: {
        url: `/uploads/noticias/${fileName}`,
        nombre: nombre,
        noticiaId: noticiaId
      }
    })

    console.log('✅ Foto guardada en BD:', foto.id)

    return NextResponse.json({
      success: true,
      data: foto,
      message: 'Foto subida exitosamente'
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
      const filePath = join(process.cwd(), 'public', foto.url)
      await unlink(filePath)
      console.log(`✅ Eliminado archivo: ${filePath}`)
    } catch (error) {
      console.error(`Error eliminando archivo:`, error)
    }

    await prisma.noticiaFoto.delete({
      where: { id }
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