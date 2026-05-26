const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');

async function seedDatabase() {
  try {
    console.log('[v0] Iniciando seeding de base de datos...');

    // Parsear DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('[v0] ⚠ DATABASE_URL no configurada, saltando seeding');
      return;
    }

    // Extraer credenciales
    const urlParts = new URL(dbUrl);
    const config = {
      host: urlParts.hostname,
      port: urlParts.port || 3306,
      user: urlParts.username,
      password: urlParts.password,
      database: urlParts.pathname.slice(1),
    };

    const connection = await mysql.createConnection(config);
    console.log('[v0] Conectado a base de datos para seeding');

    // Verificar si ya existe un usuario
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM User');
    
    if (users[0].count > 0) {
      console.log('[v0] La tabla User ya contiene usuarios, saltando seeding');
      await connection.end();
      return;
    }

    // Hash de la contraseña demo
    const hashedPassword = await bcrypt.hash('demo123456', 10);

    // Insertar usuario de prueba
    const sqlInsert = 'INSERT INTO User (email, password, name) VALUES (?, ?, ?)';
    await connection.execute(sqlInsert, [
      'demo@example.com',
      hashedPassword,
      'Usuario Demo'
    ]);

    console.log('[v0] ✓ Usuario demo creado: demo@example.com / demo123456');

    // Insertar una rifa de ejemplo
    const sqlRifa = 'INSERT INTO Rifa (numero, descripcion, userId, estado) VALUES (?, ?, ?, ?)';
    await connection.execute(sqlRifa, [
      '001',
      'Rifa de ejemplo',
      1,
      'activo'
    ]);

    console.log('[v0] ✓ Rifa de ejemplo creada');

    await connection.end();
    console.log('[v0] ✓ Seeding completado exitosamente');
  } catch (error) {
    console.error('[v0] Error durante seeding:', error.message);
  }
}

seedDatabase();
