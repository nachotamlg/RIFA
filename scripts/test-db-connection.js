const mysql = require('mysql2/promise');

/**
 * Script para probar la conexión a la base de datos
 * Verifica:
 * 1. Que DATABASE_URL está configurada
 * 2. Que la conexión a la BD es posible
 * 3. Que las tablas existen
 */

async function testDatabaseConnection() {
  try {
    console.log('[v0] 🧪 Iniciando test de conexión a base de datos...\n');

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('[v0] ✗ ERROR: DATABASE_URL no está configurada');
      console.log('[v0] Configura la variable de entorno y vuelve a intentar');
      process.exit(1);
    }

    console.log('[v0] ✓ DATABASE_URL configurada');
    console.log(`[v0] URL (sin credenciales): mysql://*:*@${new URL(dbUrl).host}${new URL(dbUrl).pathname}`);

    const urlParts = new URL(dbUrl);
    const config = {
      host: urlParts.hostname,
      port: urlParts.port || 3306,
      user: urlParts.username,
      password: urlParts.password,
      database: urlParts.pathname.slice(1),
    };

    console.log(`\n[v0] 🔗 Conectando a ${config.host}:${config.port}/${config.database}...`);

    const connection = await mysql.createConnection(config);
    console.log('[v0] ✓ Conexión exitosa\n');

    // Verificar tablas
    console.log('[v0] 📊 Verificando tablas...');
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [config.database]
    );

    if (tables.length === 0) {
      console.log('[v0] ⚠ No se encontraron tablas');
      console.log('[v0] Ejecuta: npm run db:init para crear las tablas');
    } else {
      console.log(`[v0] ✓ Se encontraron ${tables.length} tabla(s):`);
      tables.forEach(table => {
        console.log(`[v0]   - ${table.TABLE_NAME}`);
      });
    }

    // Verificar estructura de User
    if (tables.some(t => t.TABLE_NAME === 'User')) {
      console.log('\n[v0] 📋 Estructura de tabla User:');
      const [columns] = await connection.query(
        "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'User'",
        [config.database]
      );
      columns.forEach(col => {
        console.log(`[v0]   - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${col.IS_NULLABLE === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
      });
    }

    // Verificar estructura de Rifa
    if (tables.some(t => t.TABLE_NAME === 'Rifa')) {
      console.log('\n[v0] 📋 Estructura de tabla Rifa:');
      const [columns] = await connection.query(
        "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Rifa'",
        [config.database]
      );
      columns.forEach(col => {
        console.log(`[v0]   - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${col.IS_NULLABLE === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
      });
    }

    // Contar registros
    console.log('\n[v0] 📈 Conteo de registros:');
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM User');
    const [rifaCount] = await connection.query('SELECT COUNT(*) as count FROM Rifa');
    console.log(`[v0]   - User: ${userCount[0].count} registros`);
    console.log(`[v0]   - Rifa: ${rifaCount[0].count} registros`);

    await connection.end();
    console.log('\n[v0] ✅ Test completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('\n[v0] ✗ Error durante el test:', error.message);
    if (process.env.DEBUG) {
      console.error('[v0] Detalles:', error);
    }
    process.exit(1);
  }
}

testDatabaseConnection();
