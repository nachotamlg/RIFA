# 🔧 Troubleshooting - Railway Database Setup

Guía para resolver problemas comunes al desplegar la aplicación en Railway.

## ⚡ Problemas Comunes y Soluciones

### 1. "Build failed" - Prisma migration error

**Error típico:**
```
error: P1000: Authentication failed against database server
```

**Causas posibles:**
- La base de datos aún no está lista
- `DATABASE_URL` no está configurada
- Permisos insuficientes en MySQL

**Solución:**
1. En Railway, ve a tu proyecto MySQL
2. Verifica que el estado sea **"Running"** (no "Building" o "Deploying")
3. Espera 2-3 minutos después de crear la BD
4. En Railway Dashboard → tu aplicación → Settings → Redeploy
5. En los Logs, verifica que veas:
   ```
   [PostInstall] ✅ Cliente de Prisma generado
   prisma migrate deploy --skip-generate
   ```

### 2. "Database is locked" error

**Error típico:**
```
Error: database is locked
```

**Causa:**
Múltiples procesos intentan escribir en la base de datos simultáneamente

**Solución:**
1. En Railway, detén la aplicación (Stop)
2. Espera 30 segundos
3. Vuelve a iniciar (Redeploy)

### 3. "No tables exist" - datos no aparecen

**Síntoma:** 
Puedo acceder a la app pero no hay usuarios de prueba

**Causa:**
Las migraciones de Prisma no se ejecutaron

**Solución:**
```bash
# En Railway Shell (acceso via Terminal)
cd /app
pnpm prisma migrate deploy --force-skip
pnpm prisma db seed  # si está configurado
```

O manualmente desde el código:
1. En el dashboard, ve a tu aplicación
2. Haz clic en **"Terminal"** (Railway CLI)
3. Ejecuta:
   ```bash
   pnpm prisma migrate status
   pnpm prisma migrate deploy
   ```

### 4. "Connection refused" - No puede conectarse a MySQL

**Error típico:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Causa:**
- MySQL no está corriendo
- `DATABASE_URL` es incorrecta
- MySQL no está en la red de Railway

**Verificación:**
1. En Railway Dashboard, selecciona tu BD MySQL
2. Ve a **"Variables"** y copia `DATABASE_URL`
3. En tu aplicación, ve a **"Variables"**
4. Verifica que `DATABASE_URL` sea la misma
5. En la aplicación, haz clic en **"Settings"** → **"Redeploy"**

### 5. Timeout en migraciones

**Error:**
```
Error: ESOCKETTIMEDOUT
Timeout waiting for database...
```

**Causa:**
La base de datos está lenta o sobrecargada

**Solución:**
1. Aumentar timeout en el build command:
   ```
   DATABASE_TIMEOUT=30000 pnpm build
   ```
2. O reducir el tamaño de las migraciones:
   - Edita `prisma/schema.prisma`
   - Simplifica los modelos
   - Vuelve a deployar

### 6. Variables de entorno no se aplican

**Problema:**
Cambié `JWT_SECRET` pero sigue sin funcionar

**Solución:**
1. En Railway → tu app → **"Variables"**
2. Verifica que esté el nuevo valor
3. Haz clic en **"Redeploy"** (importante!)
4. Espera a que el nuevo deploy termine

### 7. Health check falla (503 error)

**Error en `GET /api/health`:**
```json
{"status": "unhealthy", "error": "Database connection failed"}
```

**Solución:**
1. Verifica que MySQL esté **"Running"**
2. Abre Railway Terminal y ejecuta:
   ```bash
   mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT 1"
   ```
3. Si falla, reinicia MySQL desde Railway

### 8. "Port 3000 already in use"

**Problema:**
Otro servicio está usando el puerto 3000

**Solución:**
En Railway, edita el archivo `railway.json`:
```json
{
  "deploy": {
    "port": 8080  // Cambia a otro puerto
  }
}
```

---

## 🔍 Verificación de Estado

### Check 1: ¿Está MySQL corriendo?

En Railway Shell:
```bash
# Conectarse a MySQL
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT VERSION();"
```

**Respuesta esperada:**
```
+---------------------+
| VERSION()           |
+---------------------+
| 8.0.35-0ubuntu0.20  |
+---------------------+
```

### Check 2: ¿Existen las tablas?

```bash
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -D $DB_NAME -e "SHOW TABLES;"
```

**Respuesta esperada:**
```
+------------------------+
| Tables_in_rifa_db      |
+------------------------+
| User                   |
| Rifa                   |
+------------------------+
```

### Check 3: ¿DATABASE_URL es válida?

```bash
echo $DATABASE_URL
# Debería mostrar algo como:
# mysql://railwayuser:password@containers-us-west-1.railway.app:3306/railway_db
```

### Check 4: ¿Está el servidor corriendo?

```bash
curl http://localhost:3000/api/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

## 📊 Ver Logs en Detalle

### Logs de Build
Railway → tu app → **"Deployments"** → [tu deploy] → **"Logs"**

Busca estas líneas para confirmar que todo funciona:
```
[PostInstall] ✅ Cliente de Prisma generado
prisma migrate deploy --skip-generate
✓ Compiled client and server successfully
```

### Logs de Runtime
Railway → tu app → **"Logs"** (en tiempo real)

Busca:
```
[Health] Database: connected
[Seed] Base de datos inicializada correctamente
```

### Logs de MySQL
Railway → tu BD MySQL → **"Logs"**

Debería mostrar:
```
mysqld: ready for connections
```

---

## 🚀 Forzar Reinicio Completo

Si nada funciona, haz un reset completo:

1. **Detener la aplicación:**
   - Railway → tu app → **"Settings"** → **"Stop"**
   - Espera 1 minuto

2. **Limpiar migraciones (CUIDADO: borra datos!):**
   ```bash
   # En Railway Shell
   mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -D $DB_NAME -e "DROP TABLE IF EXISTS _prisma_migrations;"
   ```

3. **Redeploy:**
   - Railway → tu app → **"Settings"** → **"Redeploy"**

4. **Verificar:**
   ```bash
   pnpm prisma migrate status
   ```

---

## ✅ Checklist Final

Después de resolver el problema, verifica:

- [ ] `GET /api/health` retorna `"status": "healthy"`
- [ ] Puedo iniciar sesión con `admin@rifa.local` / `admin123`
- [ ] Puedo crear nuevos números de rifa
- [ ] Los logs no muestran errores
- [ ] Railway Dashboard muestra estado "Success"

---

## 📞 Obtener Ayuda

Si sigue sin funcionar:

1. **Recopila esta información:**
   ```bash
   # En Railway Shell
   pnpm prisma migrate status
   mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -D $DB_NAME -e "SELECT COUNT(*) FROM User;"
   ```

2. **Abre un issue** en GitHub con:
   - El error exacto (copiar del log)
   - Output de los comandos arriba
   - Tu `railway.json`
   - Tu `prisma/schema.prisma`

3. **Contacta a Railway Support:**
   - https://railway.app/support

---

**¿Todo funciona?** ¡Felicidades! 🎉

Ahora puedes agregar más usuarios, números de rifa, y escalar tu aplicación sin problemas.
