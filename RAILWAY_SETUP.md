# Configuración de Base de Datos en Railway

Este proyecto está configurado para crear automáticamente las tablas en MySQL sin depender de las migraciones de Prisma.

## ¿Cómo funciona?

1. **Build Phase**: Next.js se compila normalmente sin conectarse a la base de datos
2. **Deploy Phase**: Al iniciar el contenedor, se ejecuta:
   - `node scripts/init-db.js` - Ejecuta SQL puro para crear las tablas
   - `npx prisma generate` - Genera el cliente de Prisma
   - `next start` - Inicia la aplicación

## Archivos importantes

- `database/init.sql` - Definición SQL de las tablas (User y Rifa)
- `scripts/init-db.js` - Script que ejecuta el SQL puro en la base de datos
- `railway.json` - Configuración de Railway para el deploy

## Paso a paso para configurar en Railway

### 1. Conectar MySQL
- Ve a tu proyecto en Railway
- Click en "Add +" 
- Selecciona "MySQL"
- Railway creará automáticamente la variable de entorno `DATABASE_URL`

### 2. Verificar variables de entorno
Asegúrate de que `DATABASE_URL` esté configurada:
```
mysql://user:password@host:port/database
```

### 3. Deploy
- Push a la rama que tienes vinculada a Railway
- Railway ejecutará automáticamente `node scripts/init-db.js`
- Las tablas se crearán en tu base de datos

### 4. Verificar los logs
En el dashboard de Railway, revisa los logs de deployment:
```
[v0] Iniciando configuración de base de datos...
[v0] Conectando a mysql.railway.internal:3306/railway
[v0] Conexión exitosa a la base de datos
[v0] Ejecutando: CREATE TABLE IF NOT EXISTS User...
[v0] Ejecutando: CREATE TABLE IF NOT EXISTS Rifa...
[v0] ✓ Base de datos inicializada correctamente
```

## Estructura de las tablas

### User
- `id` (INT, Primary Key, Auto Increment)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR)
- `name` (VARCHAR, Optional)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Rifa
- `id` (INT, Primary Key, Auto Increment)
- `numero` (VARCHAR, Unique)
- `descripcion` (TEXT, Optional)
- `ganador` (VARCHAR, Optional)
- `estado` (VARCHAR) - valores: 'activo', 'vendido', 'ganador'
- `userId` (INT, Foreign Key → User.id)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## Ventajas de esta solución

✅ Sin errores de conexión durante el build
✅ Las tablas se crean en el startup sin depender de migraciones de Prisma
✅ Compatible con Prisma para consultas en la aplicación
✅ Rápido y confiable

## Solución de problemas

**Error: DATABASE_URL no configurada**
- Verifica que hayas conectado MySQL en Railway
- Revisa que la variable de entorno esté visible en el dashboard

**Error: Can't reach database server**
- Espera a que el contenedor de MySQL inicie completamente
- Railway automáticamente reintentar 5 veces antes de fallar

**Las tablas no se crean**
- Revisa los logs de deployment en Railway
- Verifica que `database/init.sql` no tenga errores SQL
