/**
 * Script para crear un usuario de prueba en la base de datos
 * Uso: node --env-file=.env.build scripts/create-test-user.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  let connection;
  
  try {
    // Validar que tenemos DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL no está definido');
    }

    console.log('[v0] Conectando a la base de datos...');
    
    // Crear conexión
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('[v0] ✓ Conexión exitosa');

    // Datos del usuario de prueba
    const testUser = {
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Usuario Prueba'
    };

    // Hashear contraseña
    console.log('[v0] Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    // Verificar si el usuario ya existe
    console.log('[v0] Verificando si el usuario ya existe...');
    const [existingUsers] = await connection.query(
      'SELECT id FROM User WHERE email = ?',
      [testUser.email]
    );

    if (existingUsers.length > 0) {
      console.log('[v0] ⚠ El usuario ya existe en la base de datos');
      console.log(`[v0] Email: ${testUser.email}`);
      console.log(`[v0] Contraseña: ${testUser.password}`);
      return;
    }

    // Insertar usuario
    console.log('[v0] Creando usuario de prueba...');
    const [result] = await connection.query(
      'INSERT INTO User (email, password, name) VALUES (?, ?, ?)',
      [testUser.email, hashedPassword, testUser.name]
    );

    console.log('[v0] ✓ Usuario creado exitosamente');
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('[v0] CREDENCIALES DE PRUEBA:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`[v0] Email: ${testUser.email}`);
    console.log(`[v0] Contraseña: ${testUser.password}`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('[v0] Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('[v0] Conexión cerrada');
    }
  }
}

// Ejecutar el script
createTestUser();
