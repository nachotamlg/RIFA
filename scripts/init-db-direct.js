const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('[v0] Iniciando inicialización directa de BD...');

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('[v0] DATABASE_URL no configurada, saltando inicialización');
      return true;
    }

    const urlParts = new URL(dbUrl);
    const config = {
      host: urlParts.hostname,
      port: urlParts.port || 3306,
      user: urlParts.username,
      password: urlParts.password,
      database: urlParts.pathname.slice(1),
    };

    console.log(`[v0] Conectando a ${config.host}:${config.port}/${config.database}`);

    // Reintentos con backoff exponencial
    let connection;
    let retries = 10;
    let delay = 1000;

    while (retries > 0) {
      try {
        connection = await mysql.createConnection(config);
        console.log('[v0] ✓ Conexión exitosa');
        break;
      } catch (error) {
        retries--;
        if (retries > 0) {
          console.log(`[v0] ⚠ Reintentando en ${delay}ms (${retries} intentos restantes)...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * 1.5, 5000);
        } else {
          throw error;
        }
      }
    }

    // Leer SQL
    const sqlFile = path.join(__dirname, '../database/init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('[v0] Ejecutando SQL...');

    // Ejecutar cada sentencia por separado
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    let success = 0;
    let skipped = 0;

    for (const statement of statements) {
      if (statement) {
        try {
          console.log(`[v0] Ejecutando: ${statement.substring(0, 40)}...`);
          await connection.execute(statement);
          success++;
        } catch (err) {
          if (err.message.includes('already exists') || err.code === 'ER_TABLE_EXISTS_ERROR') {
            skipped++;
            console.log('[v0] → Ya existe');
          } else {
            console.warn(`[v0] ⚠ ${err.message}`);
          }
        }
      }
    }

    await connection.end();

    console.log(`[v0] ✓ Inicialización completada`);
    console.log(`[v0]   Ejecutadas: ${success}, Existentes: ${skipped}`);
    return true;

  } catch (error) {
    console.error('[v0] ✗ Error:', error.message);
    return false;
  }
}

if (require.main === module) {
  initializeDatabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { initializeDatabase };
