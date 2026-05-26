import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de la base de datos...')

  // Las tablas ya se crean automáticamente con las migraciones
  // Este script puede usarse para datos iniciales si es necesario

  console.log('✅ Base de datos lista')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
