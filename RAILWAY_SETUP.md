# Configuración de Railway con Prisma

Este proyecto está configurado para crear automáticamente las tablas de la base de datos al hacer deploy en Railway.

## ¿Cómo funciona?

1. **Build Phase**: Next.js se compila normalmente SIN conectarse a la base de datos
2. **Deploy Phase**: Se ejecuta automáticamente `npx prisma generate && node scripts/migrate.js` que corre `prisma migrate deploy`
3. **Tablas**: Las tablas se crean según el schema de Prisma (`prisma/schema.prisma`) DESPUÉS de que el contenedor inicia

## Configuración en Railway

### 1. Conectar Base de Datos
- En Railway, ve a **Settings** → **Variables**
- Asegúrate de que exista la variable `DATABASE_URL`
- Railway proporciona automáticamente esta URL cuando conectas un plugin de MySQL

### 2. Variables de Entorno Requeridas
```
DATABASE_URL=mysql://user:password@host:port/database
NODE_ENV=production
JWT_SECRET=tu-secreto-aqui
```

### 3. Verificar el Deploy
- Durante el build, Next.js se compila sin conectar a la BD
- Al iniciar el contenedor, Railway ejecutará: `npx prisma generate && node scripts/migrate.js && next start`
- Revisa los logs para ver si las migraciones se completaron
- Las tablas se crearán automáticamente en tu base de datos durante el startup

## Scripts Disponibles

```bash
# Ejecutar migraciones localmente
npm run prisma:migrate

# Regenerar Prisma Client
npm run prisma:generate

# Desarrollo local
npm run dev

# Build
npm run build
```

## Solución de Problemas

### Las tablas no se crean
1. Verifica que `DATABASE_URL` esté correctamente configurada en Railway
2. Asegúrate de que el usuario de MySQL tenga permisos CREATE
3. Revisa los logs de Railway para errores de conexión

### Error de conexión a la base de datos
1. Verifica que la base de datos MySQL esté iniciada en Railway
2. Confirma que `DATABASE_URL` sea correcto
3. Comprueba que el puerto sea accesible (generalmente 3306 para MySQL)

### Migraciones falla localmente
```bash
# Regenerar Prisma Client
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate
```

## Estructura de Base de Datos

El proyecto usa dos tablas principales:

### User
```sql
- id (Int, PK, Auto-increment)
- email (String, Unique)
- password (String)
- name (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Rifa
```sql
- id (Int, PK, Auto-increment)
- numero (String, Unique)
- descripcion (String, Optional)
- ganador (String, Optional)
- estado (String, Default: "activo")
- userId (Int, FK → User.id)
- createdAt (DateTime)
- updatedAt (DateTime)
```

## Más Información
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Railway](https://docs.railway.app)
