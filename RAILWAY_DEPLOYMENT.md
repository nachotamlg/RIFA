# 🚂 Guía de Despliegue en Railway

Esta guía te ayudará a deployar el Sistema de Gestión de Números de Rifa en Railway con base de datos MySQL automática.

## Paso 1: Preparar tu código en GitHub

1. Crea un repositorio en GitHub (si no lo tienes)
2. Sube tu código:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/tu-repo.git
   git push -u origin main
   ```

## Paso 2: Crear una cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en **"Start Project"** o **"Create New Project"**
3. Selecciona **"Deploy from GitHub"**
4. Autoriza a Railway para acceder a tu GitHub
5. Selecciona tu repositorio

## Paso 3: Agregar MySQL Database

1. En el dashboard de Railway, haz clic en **"+ New"** o **"Add Services"**
2. Selecciona **"Database"** → **"MySQL"**
3. Railway creará automáticamente una instancia de MySQL
4. La variable `DATABASE_URL` se configurará automáticamente

## Paso 4: Configurar Variables de Entorno

1. En el panel de Railway, ve a la sección **"Variables"**
2. Agrega la siguiente variable:

   | Clave | Valor |
   |-------|-------|
   | `JWT_SECRET` | Genera una cadena aleatoria segura (ej: `openssl rand -hex 32`) |

   Ejemplo de JWT_SECRET válido:
   ```
   c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3
   ```

3. La variable `DATABASE_URL` se configurará automáticamente desde el plugin MySQL

## Paso 5: Configurar Build & Deploy

Railway debería detectar automáticamente que es un proyecto Next.js. Si no lo hace:

1. Ve a la sección **"Settings"**
2. En **"Build Command"**, asegúrate que esté:
   ```
   pnpm install && pnpm prisma generate && pnpm build
   ```

3. En **"Start Command"**, asegúrate que esté:
   ```
   pnpm start
   ```

## Paso 6: Ejecutar Migraciones de Prisma

La primera vez que se deploya, las migraciones se ejecutan automáticamente. Sin embargo, si necesitas ejecutarlas manualmente:

1. En Railway, ve a **"Deployments"**
2. Haz clic en tu deploy actual
3. Ve a **"Logs"** para ver si se ejecutaron las migraciones
4. Si hay error, puedes ir a **"Terminal"** y ejecutar:
   ```bash
   pnpm prisma migrate deploy
   ```

## Paso 7: Verificar el Despliegue

1. Una vez que el estado sea **"Success"**, Railway te dará una URL pública
2. Accede a esa URL en tu navegador
3. Deberías ver la página de login
4. ¡Prueba registrándote y creando algunos números de rifa!

## Troubleshooting

### El build falla con error de Prisma

**Solución**: Asegúrate que `DATABASE_URL` esté configurada antes del build.

### Error 500 al acceder a la aplicación

1. Ve a los logs de Railway
2. Busca errores relacionados con la BD
3. Verifica que la conexión a MySQL sea correcta

### La BD no tiene tablas

Las tablas se crean automáticamente con las migraciones. Si no aparecen:

1. Ve a **"Terminal"** en Railway
2. Ejecuta:
   ```bash
   pnpm prisma migrate deploy
   pnpm prisma db push
   ```

## Variables de Entorno en Railway

Railway configura automáticamente las siguientes variables desde los plugins:

- `DATABASE_URL` - Desde el plugin MySQL (Formato: `mysql://user:pass@host:port/db`)

Tú debes configurar manualmente:

- `JWT_SECRET` - Tu clave secreta para tokens JWT

## Actualizar la Aplicación

Para actualizar tu aplicación después del despliegue inicial:

1. Realiza cambios en tu código local
2. Haz commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Actualizar descripción"
   git push origin main
   ```
3. Railway detectará automáticamente el cambio y hará un nuevo deploy

## Monitoreo y Logs

Para ver los logs de tu aplicación:

1. Ve a tu proyecto en Railway
2. Selecciona tu aplicación
3. Haz clic en **"Logs"**
4. Aquí verás todos los eventos del servidor

## Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio en lugar del de Railway:

1. En Railway, ve a **"Settings"**
2. Busca la sección **"Domain"**
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar los DNS

## Costo

Railway ofrece:
- **5 dólares mensuales** de crédito gratuito
- MySQL y Next.js están dentro de los servicios gratuitos
- Perfecto para proyectos pequeños y medianos

## Recursos Útiles

- [Documentación de Railway](https://docs.railway.app)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Next.js](https://nextjs.org/docs)

---

**¡Listo!** Tu sistema de rifa está deployado en Railway y totalmente funcional. 🎉
