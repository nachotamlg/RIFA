import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('[Seed] Iniciando seeding de base de datos...')

    // Check if data already exists
    const userCount = await prisma.user.count()
    if (userCount > 0) {
      console.log('[Seed] La base de datos ya tiene usuarios, saltando seeding')
      return
    }

    console.log('[Seed] Creando usuarios de prueba...')

    // Create admin user
    const hashedAdminPassword = await bcrypt.hash('admin123', 10)
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@rifa.local',
        password: hashedAdminPassword,
        name: 'Administrador',
      },
    })

    console.log('[Seed] Usuario admin creado:', adminUser.email)

    // Create test user
    const hashedTestPassword = await bcrypt.hash('test123', 10)
    const testUser = await prisma.user.create({
      data: {
        email: 'test@rifa.local',
        password: hashedTestPassword,
        name: 'Usuario Prueba',
      },
    })

    console.log('[Seed] Usuario de prueba creado:', testUser.email)

    // Create sample rifa numbers
    console.log('[Seed] Creando números de rifa de prueba...')

    const sampleRifas = await prisma.rifa.createMany({
      data: [
        {
          numero: '001',
          descripcion: 'Primer número de prueba',
          estado: 'activo',
          userId: adminUser.id,
        },
        {
          numero: '002',
          descripcion: 'Segundo número de prueba',
          estado: 'activo',
          userId: adminUser.id,
        },
        {
          numero: '003',
          descripcion: 'Tercer número de prueba',
          estado: 'vendido',
          ganador: 'Juan Pérez',
          userId: adminUser.id,
        },
        {
          numero: '004',
          descripcion: 'Cuarto número de prueba',
          estado: 'activo',
          userId: testUser.id,
        },
        {
          numero: '005',
          descripcion: 'Quinto número de prueba',
          estado: 'ganador',
          ganador: 'María González',
          userId: testUser.id,
        },
      ],
    })

    console.log('[Seed] Se crearon', sampleRifas.count, 'números de rifa de prueba')
    console.log('[Seed] ✅ Base de datos inicializada correctamente')
  } catch (error) {
    console.error('[Seed] Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
