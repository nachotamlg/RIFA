# Quick Start - Base de Datos sin Migraciones Prisma

## 🚀 En 30 Segundos

```bash
# 1. Configurar variable de entorno local
echo "DATABASE_URL=mysql://usuario:contraseña@localhost:3306/rifa" > .env.local

# 2. Crear tablas
npm run db:init:local

# 3. Verificar que funciona
npm run db:test

# 4. Iniciar desarrollo
npm run dev
```

## 📋 Comandos Disponibles

| Comando | Uso |
|---------|-----|
| `npm run db:init:local` | Crear tablas (usa .env.local) |
| `npm run db:init` | Crear tablas (usa DATABASE_URL) |
| `npm run db:test` | Verificar conexión y tablas |
| `npm run build` | Build + crear tablas automáticamente |
| `npm run dev` | Iniciar desarrollo |

## 🔧 Configuración en Railway

1. **Variables de entorno en Railway:**
   - Agregar `DATABASE_URL` con la cadena de conexión MySQL
   - Asegurar que la BD está disponible antes del deploy

2. **Despliegue automático:**
   ```
   El archivo railway.json ejecutará automáticamente:
   1. npm run build (sin intentar conectar a BD)
   2. node scripts/init-db-safe.js (crea tablas con reintentos automáticos)
   3. npm start (inicia la app)
   ```

## ✅ Verificar que las tablas se crearon

```bash
npm run db:test
```

Deberías ver:
```
✓ Conexión exitosa
✓ Se encontraron 2 tabla(s):
  - User
  - Rifa
```

## 🛠️ Solucionar Problemas

### Error: "DATABASE_URL no está configurada"
```bash
# En desarrollo local:
echo "DATABASE_URL=mysql://user:pass@localhost:3306/db" > .env.local

# En Railway:
# Ve a Project Settings → Variables y agrega DATABASE_URL
```

### Error: "ECONNREFUSED" o "Cannot reach database"
```bash
# En desarrollo local:
# Verifica que la BD está corriendo en localhost:3306
# O revisa la URL en .env.local
npm run db:test  # Para ver detalles del error

# En Railway:
# El script init-db-safe.js reintentará automáticamente 10 veces
# Verifica en los logs de Railway que la conexión se establece
```

### Las tablas no se crean
```bash
# Ejecuta manualmente:
npm run db:init:local

# O con debug:
DEBUG=1 npm run db:init:local
```

## 📚 Más Información

Ver [DATABASE_SETUP.md](./DATABASE_SETUP.md) para documentación completa.

## 🎯 Resumen de Cómo Funciona

1. **SQL sin migraciones:** Las tablas se definen en `/database/init.sql`
2. **Script de init:** `/scripts/init-db.js` las ejecuta
3. **Automático en despliegue:** Railway ejecuta el script antes de iniciar la app
4. **Prisma sigue funcionando:** Para queries, solo genera client

**Importante:** ❌ No uses `prisma migrate deploy` ✅ Usa `npm run db:init`
