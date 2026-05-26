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
      process.exit(0);
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

    // Crear conexión con reintentos
    let connection;
    let retries = 5;
    let lastError;

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
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }

    if (!connection) {
      throw lastError;
    }

    // Leer archivo SQL
    const sqlFile = path.join(__dirname, '../database/init.sql');
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`Archivo SQL no encontrado: ${sqlFile}`);
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

    for (const statement of statements) {
      if (statement) {
        console.log(`[v0] Ejecutando: ${statement.substring(0, 60).replace(/\n/g, ' ')}...`);
        try {
          await connection.execute(statement);
          successCount++;
        } catch (error) {
          // Ignorar errores si la tabla ya existe o el índice existe
          if (
            error.message.includes('already exists') ||
            error.message.includes('Duplicate key name') ||
            error.code === 'ER_TABLE_EXISTS_ERROR'
          ) {
            skipCount++;
            console.log('[v0] → Elemento ya existe, continuando...');
          } else {
            throw error;
          }
        }
      }
    }

    await connection.end();
    console.log(`[v0] ✓ Base de datos inicializada correctamente`);
    console.log(`[v0]   - Sentencias ejecutadas: ${successCount}`);
    console.log(`[v0]   - Elementos existentes: ${skipCount}`);
    process.exit(0);
  } catch (error) {
    console.error('[v0] ✗ Error al inicializar la base de datos:', error.message);
    if (process.env.DEBUG) {
      console.error('[v0] Detalles:', error);
    }
    process.exit(1);
  }
}

initializeDatabase();
