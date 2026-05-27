const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('[v0] Iniciando creación de usuario de prueba...');

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('Test123!', 10);

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      console.log('[v0] ⚠ El usuario test@example.com ya existe en la base de datos');
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('[v0] CREDENCIALES DISPONIBLES:');
      console.log('═══════════════════════════════════════════════════════');
      console.log('[v0] Email: test@example.com');
      console.log('[v0] Contraseña: Test123!');
      console.log('═══════════════════════════════════════════════════════\n');
      return;
    }

    // Crear usuario de prueba
    console.log('[v0] Creando nuevo usuario de prueba...');
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Usuario Prueba'
      }
    });

    console.log('[v0] ✓ Usuario de prueba creado exitosamente');
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('[v0] CREDENCIALES DE PRUEBA:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('[v0] Email: test@example.com');
    console.log('[v0] Contraseña: Test123!');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('[v0] Error durante seeding:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
