// Este script se ejecuta automáticamente después de pnpm install
// Genera el cliente de Prisma si es necesario

const { execSync } = require('child_process')
const fs = require('fs')

try {
  // Check if Prisma client is already generated
  const prismaGeneratedPath = 'node_modules/.prisma/client'
  
  if (!fs.existsSync(prismaGeneratedPath)) {
    console.log('[PostInstall] Generando cliente de Prisma...')
    execSync('prisma generate', { stdio: 'inherit' })
    console.log('[PostInstall] ✅ Cliente de Prisma generado exitosamente')
  } else {
    console.log('[PostInstall] Cliente de Prisma ya existe, saltando generación')
  }
} catch (error) {
  console.log('[PostInstall] ⚠️ No se pudo generar Prisma:', error.message)
  console.log('[PostInstall] Esto será intendado en el build command de Railway')
}
