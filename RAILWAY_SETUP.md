# Configuración de Base de Datos en Railway

Este proyecto está configurado para crear automáticamente las tablas en PostgreSQL sin depender de las migraciones de Prisma.

## ¿Cómo funciona?

1. **Build Phase**: 
   - Se genera Prisma Client usando `.env.build` (solo necesita un DATABASE_URL dummy)
   - Next.js se compila normalmente sin conectarse a la base de datos real
2. **Deploy Phase**: Al iniciar el contenedor, se ejecuta:
   - `node scripts/init-db.js` - Se conecta a PostgreSQL usando DATABASE_URL real y ejecuta SQL puro para crear las tablas
   - `next start` - Inicia la aplicación

## Archivos importantes

- `.env.build` - Environment variables dummy para el build (Prisma generate)
- `.env.example` - Template de variables de entorno
- `database/init.sql` - Definición SQL de las tablas (User y Rifa) en PostgreSQL
- `scripts/init-db.js` - Script que ejecuta el SQL puro en la base de datos en startup
- `scripts/prisma-generate.js` - Script que genera Prisma Client en el build
- `railway.json` - Configuración de Railway para el deploy
- `package.json` - Scripts de build configurados para usar .env.build

## Paso a paso para configurar en Railway

### 1. Conectar PostgreSQL
- Ve a tu proyecto en Railway
- Click en "Add +" 
- Selecciona "PostgreSQL"
- Railway creará automáticamente la variable de entorno `DATABASE_URL`

### 2. Verificar variables de entorno
Asegúrate de que `DATABASE_URL` esté configurada:
```
postgresql://user:password@host:port/database
```

### 3. Deploy
- Push a la rama que tienes vinculada a Railway
- Railway ejecutará automáticamente `node scripts/init-db.js`
- Las tablas se crearán en tu base de datos

### 4. Verificar los logs
En el dashboard de Railway, revisa los logs de deployment:
```
[v0] Iniciando configuración de base de datos...
[v0] Conectando a PostgreSQL...
[v0] Conexión exitosa a la base de datos
[v0] Ejecutando: CREATE TABLE IF NOT EXISTS "User"...
[v0] Ejecutando: CREATE TABLE IF NOT EXISTS "Rifa"...
[v0] ✓ Base de datos inicializada correctamente
```

## Estructura de las tablas

### User
- `id` (SERIAL, Primary Key)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR)
- `name` (VARCHAR, Optional)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Rifa
- `id` (SERIAL, Primary Key)
- `numero` (VARCHAR, Unique)
- `descripcion` (TEXT, Optional)
- `ganador` (VARCHAR, Optional)
- `estado` (VARCHAR) - valores: 'activo', 'vendido', 'ganador'
- `userId` (INT, Foreign Key → User.id)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## Ventajas de esta solución

✅ PostgreSQL se crea automáticamente en Railway (sin pasos manuales)
✅ Sin errores de conexión durante el build
✅ Las tablas se crean en el startup sin depender de migraciones de Prisma
✅ Compatible con Prisma para consultas en la aplicación
✅ Rápido y confiable

## Solución de problemas

**Error: DATABASE_URL no configurada**
- Verifica que hayas conectado PostgreSQL en Railway
- Revisa que la variable de entorno esté visible en el dashboard

**Error: Can't reach database server**
- Espera a que el contenedor de PostgreSQL inicie completamente
- Railway automáticamente reintentar 5 veces antes de fallar

**Las tablas no se crean**
- Revisa los logs de deployment en Railway
- Verifica que `database/init.sql` no tenga errores SQL
