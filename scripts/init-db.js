const { Client } = require('pg');
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

    // Crear cliente de PostgreSQL
    const client = new Client({
      connectionString: dbUrl,
    });

    console.log('[v0] Conectando a PostgreSQL...');

    // Conectar con reintentos
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        await client.connect();
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

    if (!client) {
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
          await client.query(statement);
        } catch (error) {
          // Ignorar errores si la tabla/índice ya existe
          if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
            throw error;
          }
          console.log('[v0] Tabla/Índice ya existe, continuando...');
        }
      }
    }

    await client.end();
    console.log('[v0] ✓ Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('[v0] ✗ Error al inicializar la base de datos:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
