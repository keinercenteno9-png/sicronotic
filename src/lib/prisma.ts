// src/lib/prisma.ts
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

console.log('🔧 Inicializando Prisma Client...')

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL no está definida')
}

const pool = new Pool({
  connectionString,
})

const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  console.log('✅ Prisma Client inicializado en modo desarrollo')
}

// Verificar conexión a la base de datos
prisma.$connect()
  .then(() => {
    console.log('✅ Conexión a PostgreSQL exitosa')
  })
  .catch((error) => {
    console.error('❌ Error de conexión a PostgreSQL:', error.message)
  })
prisma.$connect()
  .then(() => console.log('✅ Conexión a PostgreSQL exitosa'))
  .catch((error) => console.error('❌ Error conectando a PostgreSQL:', error))