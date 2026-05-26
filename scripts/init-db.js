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
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    console.log(`[v0] Conectando a ${config.host}:${config.port}/${config.database}`);

    // Crear conexión con reintentos
    let connection;
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        connection = await mysql.createConnection(config);
        console.log('[v0] Conexión exitosa a la base de datos');
        break;
      } catch (error) {
        lastError = error;
        retries--;
        if (retries > 0) {
          console.log(`[v0] Reintentando conexión (${retries} intentos restantes)...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (!connection) {
      throw lastError;
    }

    // Leer archivo SQL
    const sqlFile = path.join(__dirname, '../database/init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar sentencias SQL
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        console.log(`[v0] Ejecutando: ${statement.substring(0, 50)}...`);
        try {
          await connection.execute(statement);
        } catch (error) {
          // Ignorar errores si la tabla ya existe
          if (!error.message.includes('already exists')) {
            throw error;
          }
          console.log('[v0] Tabla ya existe, continuando...');
        }
      }
    }

    await connection.end();
    console.log('[v0] ✓ Base de datos inicializada correctamente');

    // Ejecutar seeding
    console.log('[v0] Ejecutando seeding...');
    const { execSync } = require('child_process');
    try {
      execSync('node scripts/seed.js', { stdio: 'inherit' });
    } catch (error) {
      console.warn('[v0] Advertencia durante seeding:', error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('[v0] ✗ Error al inicializar la base de datos:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
