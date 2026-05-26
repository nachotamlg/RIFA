# 📊 Configuración y Arquitectura de Base de Datos

Este documento explica cómo funciona la inicialización automática de la base de datos en diferentes entornos.

## 🏗️ Arquitectura de Inicialización

### Flujo General

```
┌─────────────────────────────────────────┐
│   Usuario Deploy a Railway              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  1. Railway inicia el build              │
│     - npm install                        │
│     - postinstall.js (genera Prisma)    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  2. Build Command ejecuta:              │
│     - prisma generate                   │
│     - prisma migrate deploy             │
│     - next build                        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  3. Start Command:                      │
│     - next start                        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  4. Primera solicitud al layout         │
│     - initDb() -> initializeDatabase()  │
│     - Inserta datos de prueba si BD está vacía │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  5. App lista para usar ✅              │
│     - Usuarios de prueba creados        │
│     - Números de rifa de ejemplo        │
└─────────────────────────────────────────┘
```

## 🔄 Métodos de Inicialización

### Método 1: Build Command (RECOMENDADO - Automático)

**Dónde ocurre:** Cuando Railway ejecuta el build

**Comando:**
```bash
prisma generate && prisma migrate deploy --skip-generate && next build
```

**Qué hace:**
1. Genera el cliente de Prisma
2. Ejecuta todas las migraciones en `prisma/migrations/`
3. Crea las tablas en MySQL
4. Compila la aplicación Next.js

**Ventajas:**
- ✅ Completamente automático
- ✅ No requiere intervención manual
- ✅ Se ejecuta antes de que la app inicie
- ✅ Las migraciones son versionadas en Git

**Archivos involucrados:**
- `prisma/schema.prisma` - Define la estructura
- `prisma/migrations/` - Historial de cambios
- `railway.json` - Configuración del build

### Método 2: Fallback - Layout Initialization (Seguridad)

**Dónde ocurre:** Primera solicitud a la aplicación

**Código:**
```typescript
// app/layout.tsx
await initDb()
```

**Qué hace:**
1. Verifica si la BD ya tiene usuarios
2. Si está vacía, crea usuarios de prueba
3. Inserta números de rifa de ejemplo
4. No hace nada si hay datos

**Ventajas:**
- ✅ Capa de seguridad adicional
- ✅ Asegura que siempre haya datos mínimos
- ✅ No requiere script adicional

**Archivos involucrados:**
- `lib/init-db.ts` - Lógica de inicialización
- `app/layout.tsx` - Punto de entrada

### Método 3: Script Manual (Avanzado)

**Para casos especiales:**

```bash
# En Railway Shell o localmente
pnpm prisma db seed
# O manualmente
ts-node scripts/seed-db.ts
```

**Cuándo usar:**
- Reinicializar la BD después de problemas
- Agregar más datos de prueba
- Desarrollo local

## 📁 Archivos de Configuración

### `prisma/schema.prisma`

Define la estructura de la base de datos:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  rifas Rifa[]
}

model Rifa {
  id        Int     @id @default(autoincrement())
  numero    String  @unique
  descripcion String?
  ganador   String?
  estado    String  @default("activo")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId Int
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### `prisma/migrations/`

Contiene el historial de cambios:
```
prisma/
└── migrations/
    └── init/
        └── migration.sql  # Crea las tablas inicialmente
```

### `railway.json`

Configura el build y deploy en Railway:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "startCommand": "pnpm start",
    "healthcheckPath": "/api/health"
  }
}
```

### `package.json` - Scripts

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy --skip-generate && next build",
    "start": "next start",
    "db:push": "prisma db push --skip-generate",
    "db:migrate": "prisma migrate deploy --skip-generate"
  }
}
```

## 🔐 Variables de Entorno Requeridas

### En Railway (Automáticas)

| Variable | Ejemplo | Origen |
|----------|---------|--------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/db` | Plugin MySQL |

### En Railway (Manual)

| Variable | Ejemplo | Donde Configurar |
|----------|---------|-------------------|
| `JWT_SECRET` | `c3d4e5f6...` | Railway Dashboard → Variables |
| `NODE_ENV` | `production` | Railway Dashboard → Variables |

## 🛠️ Operaciones Comunes

### Crear una nueva migración

```bash
# Modificar prisma/schema.prisma primero
# Luego:
pnpm prisma migrate dev --name add_new_field
```

### Ver estado de migraciones

```bash
pnpm prisma migrate status
```

### Rollback (revertir)

```bash
pnpm prisma migrate resolve --rolled-back migration_name
```

### Forzar sincronización (desarrollo)

```bash
pnpm prisma db push  # ¡Usa solo en desarrollo!
```

## 📊 Verificar el Estado

### Conectarse a la BD en Railway

```bash
# En Railway Terminal
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -D $DB_NAME
```

### Ver tablas creadas

```bash
SHOW TABLES;

# Resultado esperado:
# +---------+
# | Tables  |
# +---------+
# | User    |
# | Rifa    |
# +---------+
```

### Contar usuarios

```bash
SELECT COUNT(*) FROM User;

# Debe mostrar al menos 2 (admin + test)
```

## 🚀 Entornos Diferentes

### Desarrollo Local

```bash
# 1. Instalar MySQL localmente
# 2. .env.local
DATABASE_URL="mysql://root:password@localhost:3306/rifa_db"
JWT_SECRET="dev-secret-key"

# 3. Ejecutar migraciones
pnpm prisma migrate deploy

# 4. Inicializar datos
ts-node scripts/seed-db.ts

# 5. Iniciar app
pnpm dev
```

### Railway Production

```bash
# 1. Railway crea la BD automáticamente
# 2. Variables se configuran en Railway Dashboard
# 3. Build command ejecuta migraciones
# 4. Layout initialization inserta datos si están vacíos
# 5. App lista automáticamente ✅
```

### Vercel con BD Externa

```bash
# Igual que desarrollo local pero:
# - DATABASE_URL es una BD MySQL externa
# - Ejecutar migraciones manualmente antes del deploy
# - O crear un script de inicialización en /api/init
```

## 🔄 Actualizar Schema

### Proceso para cambios de BD

1. **Editar schema:**
   ```bash
   # Editar prisma/schema.prisma
   nano prisma/schema.prisma
   ```

2. **Crear migración:**
   ```bash
   pnpm prisma migrate dev --name describe_change
   ```

3. **Commit y push:**
   ```bash
   git add prisma/migrations/
   git commit -m "feat: add new field to User"
   git push origin main
   ```

4. **Deploy a Railway:**
   - Railway ejecuta automáticamente las nuevas migraciones
   - No hay downtime

## ⚠️ Datos Sensibles

### ¿Qué NO guardar en Git?

- `.env.local` - Variables locales
- `.env` - Nunca
- Credenciales reales
- Datos personales

### ¿Qué SÍ guardar en Git?

- `prisma/schema.prisma` - Estructura
- `prisma/migrations/` - Historial
- `.env.example` - Template
- `scripts/seed-db.ts` - Script de datos de prueba

## 🧪 Testing de Migraciones

### Simular en local

```bash
# 1. Crear BD de prueba
mysql -e "CREATE DATABASE test_rifa"

# 2. Apuntar a ella
DATABASE_URL="mysql://root:password@localhost:3306/test_rifa" \
pnpm prisma migrate deploy

# 3. Verificar
mysql test_rifa -e "SHOW TABLES;"

# 4. Limpiar
mysql -e "DROP DATABASE test_rifa"
```

---

**Conclusión:** El sistema está diseñado para inicializar la BD automáticamente en Railway sin intervención manual. Las migraciones de Prisma garantizan que la estructura sea consistente y versionada en Git.
