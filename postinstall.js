// Este script se ejecuta automáticamente después de pnpm install
// en entornos como Railway, para generar el cliente de Prisma

const { execSync } = require('child_process')

try {
  console.log('Generando cliente de Prisma...')
  execSync('prisma generate', { stdio: 'inherit' })
  console.log('✅ Cliente de Prisma generado exitosamente')
} catch (error) {
  console.log('⚠️ No se pudo generar Prisma (posiblemente en build)')
}
