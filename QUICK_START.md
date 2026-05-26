# Quick Start - Sistema de Rifa

## 🚀 Inicio Rápido (2 minutos)

### Local

```bash
# 1. Instalar y ejecutar migraciones (automático)
pnpm install

# 2. Configurar variables
cp .env.example .env.local
# Editar .env.local con tu DATABASE_URL

# 3. Iniciar (crea BD automáticamente)
pnpm dev

# 4. Abrir en navegador
# http://localhost:3000
```

### Credenciales de Prueba

```
Email: admin@rifa.local
Password: admin123

Email: test@rifa.local
Password: test123
```

---

## 🚢 Deploy a Railway (3 minutos)

1. **Conectar GitHub**
   ```bash
   git push origin main
   ```

2. **Crear proyecto en Railway**
   - Ir a [railway.app](https://railway.app)
   - New Project → GitHub Repo

3. **Agregar MySQL**
   - Click "+ Add Service"
   - Select MySQL
   - Railway crea `DATABASE_URL` automáticamente

4. **Agregar variable JWT_SECRET**
   - En Variables: `JWT_SECRET=tu-secreto-aqui`
   - Click Deploy

5. **¡Listo!** 🎉
   - La BD se crea automáticamente
   - Los usuarios de prueba se insertan automáticamente
   - Todo funciona sin pasos manuales

---

## 📊 Qué se crea automáticamente

✅ Tabla `user` (id, email, password, name, createdAt, updatedAt)  
✅ Tabla `rifa` (id, numero, descripcion, estado, ganador, userId, createdAt, updatedAt)  
✅ Usuario admin: admin@rifa.local / admin123  
✅ Usuario test: test@rifa.local / test123  
✅ 3 números de rifa de ejemplo  

---

## 📁 Archivos Clave

| Archivo | Función |
|---------|---------|
| `app/layout.tsx` | Ejecuta inicialización al iniciar |
| `lib/init-db.ts` | Crea usuarios y datos de prueba |
| `prisma/schema.prisma` | Define estructura de BD |
| `prisma/migrations/` | Crea las tablas |
| `postinstall.js` | Ejecuta migraciones después de install |
| `.env.example` | Variables de entorno |

---

## ⚙️ Cómo Funciona

```
pnpm install
  └─ postinstall.js
     └─ prisma migrate deploy
        └─ Crea tablas desde migrations/

pnpm dev
  └─ app/layout.tsx
     └─ initializeDatabase()
        └─ Verifica si BD está vacía
        └─ Crea usuarios de prueba
```

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
pnpm dev              # Iniciar servidor local

# Build
pnpm build            # Generar para producción

# Base de datos
pnpm prisma migrate dev --name "nombre"  # Crear nueva migración
pnpm prisma db seed                      # Ejecutar seed.ts
pnpm prisma migrate reset               # ⚠️ Reset completo

# Prisma Studio (visual)
pnpm prisma studio   # Abrir visualizador de BD en navegador
```

---

## 🆘 Solución Rápida de Problemas

### "Can't reach database"
```bash
# Verifica DATABASE_URL en .env.local
echo $DATABASE_URL
```

### "Migración no ejecutada"
```bash
pnpm prisma migrate deploy
```

### "Reiniciar con BD limpia"
```bash
pnpm prisma migrate reset  # ⚠️ Borra todo
```

---

## 📚 Documentación Completa

- **AUTO_INIT.md** - Cómo funciona la inicialización automática
- **RAILWAY_DEPLOYMENT.md** - Guía detallada para Railway
- **README.md** - Documentación completa del proyecto

---

## 💡 Notas

- La BD se inicializa **automáticamente** sin scripts SQL
- Los datos de prueba se crean **solo una vez** (idempotente)
- En Railway todo es **completamente automático**
- Puedes cambiar usuarios de prueba editando `lib/init-db.ts`

¡Listo para producción! 🚀
