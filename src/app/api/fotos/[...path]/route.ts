import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePath = join(process.cwd(), "public", "uploads", "noticias", ...resolvedParams.path);
    
    if (!existsSync(filePath)) {
      return new NextResponse("Imagen no encontrada", { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const extension = resolvedParams.path[resolvedParams.path.length - 1].split('.').pop() || '';
    
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
      'gif': 'image/gif', 'webp': 'image/webp'
    };
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeTypes[extension.toLowerCase()] || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    return new NextResponse("Error interno", { status: 500 });
  }
}