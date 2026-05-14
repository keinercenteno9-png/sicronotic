import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'stream'
import { getImageFromR2 } from '@/lib/r2'

const streamToBuffer = async (stream: Readable | ReadableStream | Blob | Buffer | Uint8Array) => {
  if (stream instanceof Buffer) {
    return stream
  }

  if (stream instanceof Uint8Array) {
    return Buffer.from(stream)
  }

  if (stream instanceof Readable) {
    const chunks: Uint8Array[] = []
    for await (const chunk of stream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk))
    }
    return Buffer.concat(chunks)
  }

  if (typeof (stream as ReadableStream).getReader === 'function') {
    const reader = (stream as ReadableStream).getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(Buffer.from(value))
    }
    return Buffer.concat(chunks)
  }

  if (stream instanceof Blob) {
    return Buffer.from(await stream.arrayBuffer())
  }

  throw new Error('Tipo de stream no soportado')
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Se requiere el nombre del archivo' },
        { status: 400 }
      )
    }

    const result = await getImageFromR2(filename)
    const body = result.Body

    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Archivo no encontrado en R2' },
        { status: 404 }
      )
    }

    const buffer = await streamToBuffer(body as Readable | ReadableStream | Blob)
    const contentType = result.ContentType ?? 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
      },
    })
  } catch (error) {
    console.error('❌ Error en GET /api/fotos/[filename]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
