const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('[v0] Iniciando configuración de base de datos...');

    // Parsear DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('[v0] ⚠ DATABASE_URL no configurada, saltando inicialización de BD');
      return true;
    }

    // Extraer credenciales de DATABASE_URL
    // Formato: mysql://user:password@host:port/database
    const urlParts = new URL(dbUrl);
    const config = {
      host: urlParts.hostname,
      port: urlParts.port || 3306,
      user: urlParts.username,
      password: urlParts.password,
      database: urlParts.pathname.slice(1), // Remover el / inicial
    };

    console.log(`[v0] Conectando a ${config.host}:${config.port}/${config.database}`);

    // Crear conexión con reintentos más agresivos
    let connection;
    let retries = 10;
    let lastError;
    let delay = 1000;

    while (retries > 0) {
      try {
        connection = await mysql.createConnection(config);
        console.log('[v0] ✓ Conexión exitosa a la base de datos');
        break;
      } catch (error) {
        lastError = error;
        retries--;
        if (retries > 0) {
          console.log(`[v0] ⚠ Reintentando conexión (${retries} intentos restantes)...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay = Math.min(delay * 1.5, 5000); // Backoff exponencial, máx 5s
        }
      }
    }

    if (!connection) {
      console.error('[v0] ✗ No se pudo conectar después de 10 intentos');
      console.error('[v0] Error:', lastError.message);
      return false;
    }

    // Leer archivo SQL
    const sqlFile = path.join(__dirname, '../database/init.sql');
    if (!fs.existsSync(sqlFile)) {
      console.error(`[v0] ✗ Archivo SQL no encontrado: ${sqlFile}`);
      await connection.end();
      return false;
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar sentencias SQL
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    console.log(`[v0] Ejecutando ${statements.length} sentencias SQL...`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement) {
        const preview = statement.substring(0, 50).replace(/\n/g, ' ');
        try {
          await connection.execute(statement);
          successCount++;
          console.log(`[v0] → ${preview}... ✓`);
        } catch (error) {
          // Ignorar errores si la tabla ya existe o el índice existe
          if (
            error.message.includes('already exists') ||
            error.message.includes('Duplicate key name') ||
            error.code === 'ER_TABLE_EXISTS_ERROR' ||
            error.message.includes('ER_DUP_KEYNAME') ||
            error.message.includes('ER_KEY_NAME_USED_TWICE')
          ) {
            skipCount++;
            console.log(`[v0] → ${preview}... (ya existe)`);
          } else {
            // Log el error pero no falla - podría ser un error de sintaxis que debería revisarse
            errorCount++;
            console.warn(`[v0] ⚠ ${preview}...`);
            console.warn(`[v0]   Error: ${error.message}`);
          }
        }
      }
    }

    await connection.end();
    
    // Mostrar resumen
    console.log(`[v0] ✓ Base de datos inicializada`);
    console.log(`[v0]   - Ejecutadas: ${successCount}`);
    console.log(`[v0]   - Existentes: ${skipCount}`);
    if (errorCount > 0) {
      console.log(`[v0]   - Errores: ${errorCount}`);
    }
    
    // Retornar true si al menos se ejecutó algo o ya existe
    return successCount > 0 || skipCount > 0;
  } catch (error) {
    console.error('[v0] ✗ Error al inicializar la base de datos:', error.message);
    if (process.env.DEBUG) {
      console.error('[v0] Detalles:', error);
    }
    return false;
  }
}

// Para uso como módulo o como script
if (require.main === module) {
  initializeDatabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { initializeDatabase };
