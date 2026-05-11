// test-db.js
const { PrismaClient } = require('@prisma/client')

async function test() {
  console.log('🔍 Probando conexión a PostgreSQL...')
  console.log('DATABASE_URL:', process.env.DATABASE_URL)
  
  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    console.log('✅ Conexión exitosa!')
    
    // Intentar consultar noticias
    const noticias = await prisma.noticia.findMany()
    console.log(`📰 Encontradas ${noticias.length} noticias`)
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

test()