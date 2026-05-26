# Inicialización Automática de Base de Datos

Este documento explica cómo funciona la creación automática de base de datos en el sistema de rifa.

## Descripción General

A diferencia de otros sistemas que requieren ejecutar scripts SQL manualmente, este proyecto **crea y inicializa la base de datos automáticamente** cuando se inicia la aplicación.

## Flujo de Inicialización

### 1. **Instalación de Dependencias** (`pnpm install`)

Cuando ejecutas `pnpm install`:

```bash
pnpm install
```

Se ejecuta automáticamente:
- `postinstall.js` - Genera el cliente de Prisma
- `prisma migrate deploy` - Ejecuta todas las migraciones pendientes
  - Las migraciones se encuentran en `prisma/migrations/`
  - Crean todas las tablas definidas en `prisma/schema.prisma`

```javascript
// postinstall.js
try {
  execSync('prisma generate', { stdio: 'inherit' })
  execSync('prisma migrate deploy', { stdio: 'inherit' })
} catch (error) {
  console.log('⚠️ BD no disponible aún (es normal en build)')
}
```

### 2. **Inicio de la Aplicación** (`pnpm dev`)

Cuando inicia la aplicación:

```bash
pnpm dev
```

El archivo `app/layout.tsx` ejecuta automáticamente:

```typescript
// app/layout.tsx
import { initializeDatabase } from '@/lib/init-db'

// Ejecuta al iniciar
initializeDatabase().catch(err => {
  console.error('[v0] Error:', err)
})
```

### 3. **Verificación e Inserción de Datos** (`lib/init-db.ts`)

La función `initializeDatabase()`:

1. **Verifica si la BD está lista**
   ```typescript
   const user = await prisma.user.findFirst()
   ```
   - Si falla: retorna silenciosamente (BD no lista en build)
   - Si existe: salta la inicialización

2. **Si no hay usuarios, crea:**
   - Usuario admin: `admin@rifa.local` / `admin123`
   - Usuario de prueba: `test@rifa.local` / `test123`
   - 3 números de rifa de ejemplo

3. **Logs informativos**
   ```
   [v0] Iniciando verificación de base de datos...
   [v0] Creando tablas e insertando datos iniciales...
   [v0] Usuario admin creado: admin@rifa.local
   [v0] Se crearon 3 números de rifa de prueba
   [v0] Base de datos inicializada correctamente
   ```

## Migraciones de Prisma

Las migraciones definen la estructura de la BD:

```
prisma/migrations/
└── init/
    ├── migration.sql      # SQL que crea tablas
    └── .migration_lock.toml
```

Archivo `migration.sql`:
- Crea tabla `User`
- Crea tabla `Rifa`
- Define relaciones y constraints

## Opciones de Inicialización

### Opción 1: Automática (Recomendado)

```bash
pnpm install  # Ejecuta migraciones
pnpm dev      # Inicializa datos de prueba
```

✅ Sin pasos manuales  
✅ Funciona en Railway  
✅ Datos de prueba listos

### Opción 2: Manual con Seed

```bash
pnpm install
pnpm prisma migrate deploy     # Ejecutar migraciones
pnpm prisma db seed            # Ejecutar seed.ts
pnpm dev
```

### Opción 3: Reset Completo

```bash
# ⚠️ Borra TODOS los datos
pnpm prisma migrate reset
```

Esto:
1. Elimina la BD
2. Recrea todas las tablas
3. Ejecuta seed.ts automáticamente

## En Railway

El flujo es automático:

1. **Push a GitHub**
   ```bash
   git push origin main
   ```

2. **Railway detecta cambios y:**
   - Corre `pnpm install` → ejecuta migraciones
   - Corre `npm run build` → genera cliente Prisma
   - Corre `npm start` → ejecuta inicialización de datos

3. **BD lista automáticamente** ✅

No necesitas hacer nada más en Railway.

## Archivo: `lib/init-db.ts`

```typescript
export async function initializeDatabase() {
  // 1. Verifica si BD está disponible
  // 2. Si ya tiene datos, salta
  // 3. Si está vacía, crea:
  //    - Usuario admin
  //    - Usuario de prueba
  //    - Números de rifa de ejemplo
  // 4. Registra en logs
}
```

Punto de entrada:
- `app/layout.tsx` - Se ejecuta automáticamente al iniciar

## Archivo: `prisma/seed.ts`

```typescript
async function main() {
  // 1. Verifica si ya hay usuarios
  // 2. Si hay, salta
  // 3. Si no hay, crea datos iniciales
}

// Se ejecuta con: pnpm prisma db seed
```

## Archivo: `postinstall.js`

```javascript
// Se ejecuta automáticamente después de pnpm install

// 1. Genera cliente Prisma
execSync('prisma generate')

// 2. Ejecuta migraciones pendientes
execSync('prisma migrate deploy')
```

## Variables de Entorno Necesarias

```env
# .env.local (local development)
DATABASE_URL="mysql://user:password@localhost:3306/rifa_db"
JWT_SECRET="tu-clave-secreta"

# En Railway: Se configura automáticamente
# - DATABASE_URL: generado por MySQL plugin
# - JWT_SECRET: agregar manualmente en Variables
```

## Flujo Resumido

```
pnpm install
    ↓
postinstall.js
    ↓
prisma migrate deploy (crea tablas)
    ↓
pnpm dev
    ↓
app/layout.tsx
    ↓
initializeDatabase()
    ↓
Crea usuarios de prueba
    ↓
✅ Sistema listo
```

## Reiniciar Inicialización

Si necesitas volver a ejecutar la inicialización:

### Opción A: Reset completo

```bash
pnpm prisma migrate reset
```

### Opción B: Eliminar usuarios manualmente

```bash
pnpm prisma db execute --stdin
# DELETE FROM rifa;
# DELETE FROM user;
# EXIT
```

### Opción C: Ejecutar seed directamente

```bash
pnpm prisma db seed
```

## Logs de Inicialización

Durante el inicio ves:

```
[v0] Iniciando verificación de base de datos...
[v0] Creando tablas e insertando datos iniciales...
[v0] Usuario admin creado: admin@rifa.local
[v0] Usuario de prueba creado: test@rifa.local
[v0] Se crearon 3 números de rifa de prueba
[v0] Base de datos inicializada correctamente
```

O si ya existe:

```
[v0] Iniciando verificación de base de datos...
[v0] Base de datos ya existe, saltando inicialización
```

## Datos por Defecto

### Usuarios Creados

| Email | Password | Rol |
|-------|----------|-----|
| admin@rifa.local | admin123 | Admin (creator) |
| test@rifa.local | test123 | User |

### Números de Rifa Creados

| Número | Estado | Ganador | Descripción |
|--------|--------|---------|-------------|
| 001 | Activo | - | Primer número de prueba |
| 002 | Activo | - | Segundo número de prueba |
| 003 | Vendido | Juan Pérez | Tercer número de prueba |

## Idempotencia

El sistema es **idempotente**: puedes ejecutar la inicialización múltiples veces sin efectos secundarios.

- ✅ Si BD está vacía: crea datos
- ✅ Si BD tiene datos: salta
- ✅ Si BD no existe: las migraciones la crean
- ✅ Seguro ejecutar varias veces

## Seguridad

⚠️ **En producción:**
- Cambiar `JWT_SECRET` por algo más seguro
- No usar las contraseñas de prueba por defecto
- Eliminar usuarios de prueba después de verificar que todo funciona

## Troubleshooting

### Error: "Can't reach database server"

Normal durante `pnpm build`. La inicialización retorna silenciosamente cuando BD no está disponible.

### Error: "Migration lock"

```bash
# Liberar lock de migración
rm prisma/migrations/migration_lock.toml
```

### Error: "Unique constraint failed"

Si intentas ejecutar seed dos veces:

```bash
# Limpiar e reiniciar
pnpm prisma migrate reset
```

---

Para preguntas, revisa `README.md` o `RAILWAY_DEPLOYMENT.md`.
