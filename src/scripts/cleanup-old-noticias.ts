import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { deleteImageFromR2 } from '../lib/r2'

const DEFAULT_DAYS = 30
const days = Number(process.argv[2] ?? process.env.CLEANUP_DAYS ?? DEFAULT_DAYS)
const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

const getFilenameFromUrl = (url: string) => {
  const segments = url.split('/')
  return segments[segments.length - 1]
}

async function cleanupOldNoticias() {
  console.log(`🧹 Limpiando noticias con más de ${days} días (creadas antes de ${cutoff.toISOString()})...`)

  const noticias = await prisma.noticia.findMany({
    where: {
      createdAt: {
        lt: cutoff,
      },
    },
    include: {
      fotos: true,
    },
  })

  if (noticias.length === 0) {
    console.log('✅ No hay noticias antiguas para eliminar.')
    return
  }

  console.log(`🔎 Se encontraron ${noticias.length} noticias antiguas.`)

  for (const noticia of noticias) {
    console.log(`
Procesando noticia ${noticia.id} - ${noticia.titulo}`)

    for (const foto of noticia.fotos) {
      const filename = getFilenameFromUrl(foto.url)
      try {
        await deleteImageFromR2(filename)
        console.log(`  ✅ Imagen eliminada: ${filename}`)
      } catch (error) {
        console.warn(`  ⚠️ No se pudo eliminar la imagen ${filename}:`, error instanceof Error ? error.message : error)
      }
    }
  }

  const noticiaIds = noticias.map((noticia) => noticia.id)
  const deleted = await prisma.noticia.deleteMany({
    where: {
      id: {
        in: noticiaIds,
      },
    },
  })

  console.log(`🗑️ Eliminadas ${deleted.count} noticias antiguas.`)
}

cleanupOldNoticias()
  .catch((error) => {
    console.error('❌ Error en cleanup-old-noticias:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
