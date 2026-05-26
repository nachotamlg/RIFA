#!/bin/bash
set -e

echo "🚀 Inicializando base de datos después del despliegue..."
node scripts/init-db.js

echo "✅ Base de datos inicializada"
