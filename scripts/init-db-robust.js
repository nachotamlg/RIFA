#!/usr/bin/env node
/**
 * Robust database initialization script
 * Reads SQL from database/init.sql and executes it
 * Handles connection retries with exponential backoff
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getConnection(config, maxRetries = 10) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[v0] Intento ${attempt}/${maxRetries}: Conectando a ${config.host}:${config.port}/${config.database}...`);
      const conn = await mysql.createConnection(config);
      console.log('[v0] ✓ Conexión exitosa');
      return conn;
    } catch (error) {
      lastError = error;
      console.log(`[v0] ✗ Fallo: ${error.message}`);
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(1.5, attempt - 1), 5000);
        console.log(`[v0] Esperando ${delay}ms antes de reintentar...`);
        await wait(delay);
      }
    }
  }
  
  throw new Error(`No se pudo conectar después de ${maxRetries} intentos: ${lastError.message}`);
}

async function main() {
  try {
    console.log('═══════════════════════════════════════════════════════');
    console.log('[v0] Database Initialization - Robust Script');
    console.log('═══════════════════════════════════════════════════════');
    
    // Validar DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('[v0] ⚠ DATABASE_URL no está definida, saltando inicialización');
      return true;
    }

    // Parsear URL
    const urlParts = new URL(dbUrl);
    const config = {
      host: urlParts.hostname,
      port: urlParts.port || 3306,
      user: urlParts.username,
      password: urlParts.password,
      database: urlParts.pathname.slice(1),
    };

    console.log(`[v0] Configuración:`);
    console.log(`[v0]   Host: ${config.host}`);
    console.log(`[v0]   Port: ${config.port}`);
    console.log(`[v0]   Database: ${config.database}`);
    console.log(`[v0]   User: ${config.user}`);

    // Conectar
    const connection = await getConnection(config);

    // Leer SQL
    const sqlPath = path.join(__dirname, '../database/init.sql');
    console.log(`\n[v0] Leyendo SQL desde: ${sqlPath}`);
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Archivo no encontrado: ${sqlPath}`);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log(`[v0] ✓ SQL leído (${sqlContent.length} bytes)`);

    // Parsear sentencias
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`\n[v0] ${statements.length} sentencias encontradas`);

    // Ejecutar
    console.log(`\n[v0] Ejecutando SQL...`);
    console.log('───────────────────────────────────────────────────────');

    let executed = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.substring(0, 50).replace(/\n/g, ' ');
      const num = i + 1;

      try {
        console.log(`[${num}/${statements.length}] ${preview}...`);
        const result = await connection.execute(stmt);
        console.log(`         ✓ Ejecutado`);
        executed++;
      } catch (err) {
        // Detectar errores ignorables
        const ignorable = 
          err.message.includes('already exists') ||
          err.message.includes('Duplicate key name') ||
          err.code === 'ER_TABLE_EXISTS_ERROR' ||
          err.code === 'ER_DUP_KEYNAME' ||
          err.code === 'ER_KEY_NAME_USED_TWICE';

        if (ignorable) {
          console.log(`         ⊘ Ya existe`);
          skipped++;
        } else {
          console.log(`         ✗ Error: ${err.message}`);
          errors++;
        }
      }
    }

    await connection.end();

    console.log('───────────────────────────────────────────────────────');
    console.log(`\n[v0] Resumen:`);
    console.log(`[v0]   Ejecutadas: ${executed}`);
    console.log(`[v0]   Existentes: ${skipped}`);
    console.log(`[v0]   Errores:    ${errors}`);

    if (errors > 0) {
      console.warn(`\n[v0] ⚠ Se encontraron ${errors} errores`);
    }

    console.log('\n[v0] ✓ Inicialización completada\n');
    console.log('═══════════════════════════════════════════════════════');

    return errors === 0;

  } catch (error) {
    console.error('\n[v0] ✗ Error crítico:', error.message);
    console.error('\n[v0] Stack trace:');
    console.error(error.stack);
    console.log('\n═══════════════════════════════════════════════════════');
    return false;
  }
}

// Ejecutar
main().then(success => {
  // Usar ; en vez de && en railway.json para no detener el startup si falla
  process.exit(success ? 0 : 1);
});
