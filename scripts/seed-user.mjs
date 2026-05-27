#!/usr/bin/env node

/**
 * Script para crear un usuario de prueba
 * Usa Prisma para conectarse a la base de datos
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUser() {
  try {
    console.log('[v0] Iniciando seed de usuario...');

    const testUser = {
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Usuario Prueba'
    };

    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email }
    });

    if (existingUser) {
      console.log('[v0] ⚠ El usuario ya existe en la base de datos');
      console.log(`[v0] Email: ${testUser.email}`);
      console.log(`[v0] Contraseña: ${testUser.password}`);
      return;
    }

    // Hashear contraseña
    console.log('[v0] Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    // Crear usuario
    console.log('[v0] Creando usuario de prueba...');
    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name
      }
    });

    console.log('[v0] ✓ Usuario creado exitosamente\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('[v0] CREDENCIALES DE PRUEBA:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`[v0] Email: ${testUser.email}`);
    console.log(`[v0] Contraseña: ${testUser.password}`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('[v0] Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedUser();
