const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('[v0] Buscando usuarios en la base de datos...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    });

    if (users.length === 0) {
      console.log('[v0] No hay usuarios en la base de datos');
    } else {
      console.log('═══════════════════════════════════════════════════════');
      console.log('[v0] USUARIOS EXISTENTES:');
      console.log('═══════════════════════════════════════════════════════');
      
      users.forEach((user, index) => {
        console.log(`\n[${index + 1}] ${user.name}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    ID: ${user.id}`);
        console.log(`    Creado: ${new Date(user.createdAt).toLocaleString('es-ES')}`);
      });
      
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('[v0] Para iniciar sesión, usa cualquiera de estos emails\n');
    }

  } catch (error) {
    console.error('[v0] Error al listar usuarios:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
