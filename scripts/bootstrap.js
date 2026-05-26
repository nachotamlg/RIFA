const { execSync } = require('child_process');

async function bootstrap() {
  try {
    console.log('[v0] Iniciando bootstrap de la aplicación...\n');

    // Paso 1: Inicializar base de datos (crear tablas)
    console.log('[v0] Paso 1: Inicializando base de datos...');
    try {
      execSync('node scripts/init-db.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('[v0] Error en init-db.js:', error.message);
      process.exit(1);
    }

    // Paso 2: Hacer seeding de datos
    console.log('\n[v0] Paso 2: Haciendo seeding de datos...');
    try {
      execSync('node scripts/seed.js', { stdio: 'inherit' });
    } catch (error) {
      console.warn('[v0] Advertencia en seed.js (esto es normal si ya existen datos):', error.message);
    }

    console.log('\n[v0] ✓ Bootstrap completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('[v0] Error fatal durante bootstrap:', error.message);
    process.exit(1);
  }
}

bootstrap();
