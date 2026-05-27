const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createUser() {
  const email = 'admin@rifas.com';
  const password = 'admin123';
  const name = 'Administrador';

  // Generar hash
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hash generado:', hashedPassword);

  // Conectar a la BD
  const urlParts = new URL(process.env.DATABASE_URL);
  const connection = await mysql.createConnection({
    host: urlParts.hostname,
    port: urlParts.port || 3306,
    user: urlParts.username,
    password: urlParts.password,
    database: urlParts.pathname.slice(1),
  });

  await connection.execute(
    'INSERT INTO User (email, password, name, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
    [email, hashedPassword, name]
  );

  console.log(`✓ Usuario creado: ${email} / ${password}`);
  await connection.end();
}

createUser().catch(console.error);