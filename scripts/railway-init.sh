#!/bin/bash
set -e

# Script para inicializar la base de datos en Railway
# Este script se ejecuta después de que la aplicación se despliega

echo "🚀 Railway: Inicializando base de datos..."

# Esperar a que la BD esté lista
echo "⏳ Esperando a que la base de datos esté disponible..."
for i in {1..30}; do
  if nc -z $DB_HOST $DB_PORT 2>/dev/null; then
    echo "✓ Base de datos disponible"
    break
  fi
  echo "  Intento $i/30..."
  sleep 2
done

# Ejecutar inicialización
echo "📊 Creando tablas..."
node scripts/init-db.js

echo "✅ Railway: Base de datos inicializada correctamente"
