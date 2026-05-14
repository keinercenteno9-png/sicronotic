import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

console.log('🔧 Inicializando Prisma Client...')

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL no está definida')
}

const adapter = new PrismaNeon({ connectionString })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  console.log('✅ Prisma Client inicializado en modo desarrollo')
}

prisma.$connect()
  .then(() => {
    console.log('✅ Conexión a PostgreSQL exitosa')
  })
  .catch((error) => {
    console.error('❌ Error de conexión a PostgreSQL:', error instanceof Error ? error.message : String(error))
  })
