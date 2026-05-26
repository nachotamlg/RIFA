# 🚂 Guía de Despliegue en Railway (Método Automático Mejorado)

Esta guía te ayudará a deployar el Sistema de Gestión de Números de Rifa en Railway con base de datos MySQL completamente automática.

## ⚡ Método Rápido (5 minutos)

### Paso 1: Preparar tu código en GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

### Paso 2: Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app) y crea una cuenta
2. Haz clic en **"Create New Project"**
3. Selecciona **"Deploy from GitHub"** 
4. Autoriza a Railway para acceder a tu GitHub
5. Selecciona tu repositorio

### Paso 3: Agregar MySQL Database

1. En el dashboard de Railway, haz clic en **"+ Add Services"**
2. Selecciona **"Database"** → **"MySQL"**
3. Railway configurará automáticamente `DATABASE_URL`

### Paso 4: Configurar Variables de Entorno

En Railway, ve a **"Variables"** y agrega:

| Clave | Valor | Descripción |
|-------|-------|-------------|
| `JWT_SECRET` | Ej: `c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3` | Clave secreta para tokens JWT |
| `NODE_ENV` | `production` | Entorno de ejecución |

**Generar JWT_SECRET seguro:**
```bash
openssl rand -hex 32
```

### Paso 5: Deploy Automático

Railway detectará automáticamente que es un proyecto Next.js. El build y deploy son completamente automáticos:

- **Build:** `prisma generate && prisma migrate deploy --skip-generate && next build`
- **Start:** `pnpm start`
- **Health Check:** `/api/health`

✅ **¡Eso es todo!** Railway ejecutará automáticamente:
1. Generará el cliente de Prisma
2. Ejecutará migraciones de base de datos
3. Creará la BD con todas las tablas
4. Insertará datos de prueba

## 📊 ¿Qué hace el sistema automáticamente?

### En el Build (durante el deploy):
```
1. prisma generate      → Genera cliente de Prisma
2. prisma migrate deploy → Ejecuta migraciones (crea tablas)
3. next build           → Compila la app
```

### Después del Deploy:
- Si la BD está vacía, inserta **usuarios de prueba** y **números de rifa**
- Verifica la salud de la aplicación cada 30 segundos

## 👤 Credenciales de Prueba

Después del primer deploy, puedes usar estas credenciales:

**Usuario Admin:**
- Email: `admin@rifa.local`
- Contraseña: `admin123`

**Usuario Prueba:**
- Email: `test@rifa.local`
- Contraseña: `test123`

## 🔍 Verificar que todo funciona

### 1. Ver logs en tiempo real:
- En Railway, ve a tu proyecto
- Haz clic en **"Logs"**
- Busca mensajes como:
  ```
  [Seed] Base de datos inicializada correctamente
  ✅ Deploy successful
  ```

### 2. Verificar la salud de la app:
```bash
# Reemplaza <tu-dominio> con tu URL de Railway
curl https://<tu-dominio>.railway.app/api/health

# Respuesta esperada:
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### 3. Acceder a la aplicación:
- Railway te asignará una URL como: `https://tu-proyecto-xyz.railway.app`
- Accede a esa URL en tu navegador
- Inicia sesión con `admin@rifa.local` / `admin123`

## 🛠️ Troubleshooting

### Error: "Database connection timeout"
**Solución:** 
1. Ve a tu BD de MySQL en Railway
2. Verifica que el estado sea **"Running"**
3. Espera 1-2 minutos después de crear la BD

### Error: "Prisma migrate deploy failed"
**Solución:**
1. Ve a los **Logs** en Railway
2. Verifica que `DATABASE_URL` esté configurada
3. En Railway Shell, ejecuta:
   ```bash
   pnpm prisma migrate deploy --force-skip
   ```

### No aparecen datos de prueba
**Solución:** Los datos se crean automáticamente solo si la BD está vacía
1. Ve a **Settings** → **Danger Zone** → **Delete Data** (si quieres reiniciar)
2. Haz un nuevo deploy
3. Los datos se crearán nuevamente

### La aplicación muestra "500 Error"
**Solución:**
1. Abre **Logs** en Railway
2. Busca errores relacionados con la BD
3. Verifica que MySQL esté corriendo
4. Asegúrate que `DATABASE_URL` sea una URL válida

## 📈 Actualizar la aplicación

Después del despliegue inicial, para actualizar:

```bash
git add .
git commit -m "Actualizar descripción"
git push origin main
```

Railway detectará automáticamente el cambio y hará un nuevo deploy. Las migraciones de BD se ejecutarán automáticamente si hay cambios en el schema.

## 🔐 Variables de Entorno Automáticas

Railway configura automáticamente estas variables desde los plugins:

- `DATABASE_URL` - URL de conexión a MySQL (Formato: `mysql://user:pass@host:port/db`)

Tú debes configurar manualmente:

- `JWT_SECRET` - Clave secreta para tokens JWT

## 📊 Monitoreo

### Ver logs en tiempo real:
```bash
# En Railway Shell
tail -f logs
```

### Revisar estado de la BD:
```bash
# Conectarse a MySQL desde Railway Shell
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME
```

## 🌐 Dominio Personalizado (Opcional)

Para usar tu propio dominio:

1. En Railway, ve a **Settings**
2. Busca **"Domain"**
3. Agrega tu dominio personalizado
4. Configura los DNS según las instrucciones de Railway

## 💰 Costo

- **Plan Gratuito:** $5 mensuales de crédito
- **MySQL + Next.js:** Dentro del plan gratuito
- **Perfecto para:** Proyectos pequeños y medianos

## 📚 Recursos Útiles

- [Documentación de Railway](https://docs.railway.app)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Endpoint de Health Check](./app/api/health/route.ts)
- [Script de Seeding](./scripts/seed-db.ts)

---

**¿Necesitas ayuda?**
- Revisa los **Logs** en Railway para ver errores específicos
- Usa el endpoint `/api/health` para verificar que la BD está conectada
- Contacta al soporte de Railway: [Railway Support](https://railway.app/support)

**¡Tu aplicación de rifa está lista en Railway! 🎉**
