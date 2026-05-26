const { execSync } = require('child_process');

async function generatePrismaClient() {
  try {
    console.log('[v0] Generando Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('[v0] ✓ Prisma Client generado correctamente');
    process.exit(0);
  } catch (error) {
    console.error('[v0] ✗ Error al generar Prisma Client:', error.message);
    process.exit(1);
  }
}

generatePrismaClient();
