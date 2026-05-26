import { prisma } from './db'

/**
 * Database initialization script
 * This runs automatically when the connection pool is first created
 * It creates tables and inserts default data if they don't exist
 */
export async function initializeDatabase() {
  try {
    console.log('[v0] Iniciando verificación de base de datos...')

    // Check if tables already exist
    let usersExist = false
    try {
      const user = await prisma.user.findFirst()
      usersExist = !!user
    } catch (error) {
      // Database might not be ready yet, this is normal during builds
      console.log('[v0] BD no disponible aún, saltando inicialización')
      return
    }

    if (usersExist) {
      console.log('[v0] Base de datos ya existe, saltando inicialización')
      return
    }

    console.log('[v0] Creando tablas e insertando datos iniciales...')

    // Create default admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@rifa.local',
        password: '$2b$10$LBFaHFQrB.w79jdoqLQzTeIn62vF.R7IbjRXVz80bHcZ9CJ3rz81q', // password: admin123
        name: 'Administrador',
      },
    })

    console.log('[v0] Usuario admin creado:', adminUser.email)

    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@rifa.local',
        password: '$2b$10$UnLdLrPRZ5HjYjbpZRtaie2WHgK3BWSwYCGx.w4E1YU/kX585tNnq', // password: test123
        name: 'Usuario Prueba',
      },
    })

    console.log('[v0] Usuario de prueba creado:', testUser.email)

    // Create sample rifa numbers
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
      ],
    })

    console.log('[v0] Se crearon', sampleRifas.count, 'números de rifa de prueba')
    console.log('[v0] Base de datos inicializada correctamente')
  } catch (error) {
    console.error('[v0] Error inicializando base de datos:', error)
    throw error
  }
}
