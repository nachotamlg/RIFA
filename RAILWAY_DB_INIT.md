# Railway Database Initialization Guide

## El Problema

Las tablas no se crean automáticamente en Railway durante el despliegue.

## La Solución

El proyecto incluye scripts que crean las tablas automáticamente desde `database/init.sql` **antes** de que la aplicación Next.js inicie.

## Cómo Funciona

### En Development (Local)

```bash
# Crear tablas manualmente
npm run db:init:local

# Verificar conexión
npm run db:test
```

### En Production (Railway)

El archivo `railway.json` ejecuta automáticamente:

```json
"startCommand": "node scripts/init-db-robust.js ; npm start"
```

Esto significa:
1. **Antes** de iniciar Next.js, ejecuta `init-db-robust.js`
2. El script se conecta a MySQL y ejecuta `database/init.sql`
3. Las tablas se crean si no existen
4. Luego inicia la app con `npm start`

## Scripts Disponibles

| Script | Uso | Reintento |
|--------|-----|-----------|
| `init-db-robust.js` | Principal en Railway | 10 intentos |
| `init-db-safe.js` | Alternativa tolerante | 10 intentos |
| `init-db-direct.js` | Simple y directo | 10 intentos |
| `init-db.js` | Básico para desarrollo | 5 intentos |

## Railway Configuration Checklist

- [ ] Variable `DATABASE_URL` está configurada
- [ ] MySQL está corriendo y accesible
- [ ] El usuario en `DATABASE_URL` tiene permisos para `CREATE TABLE`
- [ ] El archivo `railway.json` está presente en el repo
- [ ] El directorio `database/` contiene `init.sql`

## Verificar Que Funcionó

Después de desplegar en Railway:

1. **En Railway Dashboard:**
   - Ve a tu servicio
   - Click en "Logs"
   - Busca líneas con `[v0]` (del script de init)
   - Deberías ver algo como:
     ```
     [v0] Intento 1/10: Conectando a ...
     [v0] ✓ Conexión exitosa
     [v0] 2 sentencias encontradas
     [v0] Ejecutando SQL...
     [v0] ✓ Base de datos inicializada
     ```

2. **Conectar a la BD:**
   ```bash
   mysql -h <host> -u <user> -p <database>
   SHOW TABLES;  # Deberías ver: User, Rifa
   ```

3. **Ver logs desde tu app:**
   - Abre la URL de tu app en Railway
   - La app debería funcionar sin errores de "tabla no existe"

## Si Sigue Sin Funcionar

### 1. Revisar que DATABASE_URL es correcta

En Railway:
- Settings → Variables
- Busca `DATABASE_URL`
- Verifica el formato: `mysql://user:password@host:port/database`

### 2. Revisar permisos del usuario

Conecta manualmente a la BD:
```bash
mysql -h <host> -u <user> -p <database>
```

Debería poder:
```sql
CREATE TABLE test (id INT);
DROP TABLE test;
```

### 3. Ver logs detallados

En Railway, los logs mostrarán exactamente qué falló:
```
[v0] Error: Access denied for user 'user'@'host'
[v0] Error: Unknown database 'name'
[v0] Error: Table 'table' already exists
```

### 4. Si la BD no existe

Railway con el plugin MySQL debería crear la BD automáticamente. Si no:
1. Conecta manualmente
2. Ejecuta: `CREATE DATABASE nombre_db;`

### 5. Script Alternativo

Si `init-db-robust.js` no funciona, prueba:

```bash
# En local
npm run db:init:safe

# O editar railway.json:
# "startCommand": "node scripts/init-db-safe.js ; npm start"
```

## Archivo SQL (database/init.sql)

El script ejecuta este SQL:
```sql
CREATE TABLE IF NOT EXISTS User (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Rifa (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numero VARCHAR(255) UNIQUE NOT NULL,
  descripcion TEXT,
  ganador VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'activo',
  userId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_user_id (userId),
  INDEX idx_numero (numero),
  INDEX idx_estado (estado)
);
```

## Notas Importantes

- **No usa Prisma migrations**: El SQL se ejecuta directamente con `mysql2/promise`
- **Idempotente**: Usa `IF NOT EXISTS`, se puede ejecutar múltiples veces sin error
- **Tolerante**: Ignora errores de tablas/índices existentes
- **Logging**: Todo se registra en los logs de Railway con prefijo `[v0]`

## Emergency: Resetear BD Completa

Si necesitas empezar desde cero:

```bash
# En Railway console o localmente:
mysql -h <host> -u <user> -p <database>

# Borrar tablas:
DROP TABLE Rifa;
DROP TABLE User;

# Luego redeploy en Railway o:
npm run db:init:local
```

## Preguntas Frecuentes

**P: ¿Por qué no usa Prisma migrate?**  
R: Porque no querías usar migraciones de Prisma. Este método es más simple y directo.

**P: ¿Y si la BD ya tiene tablas?**  
R: El script usa `IF NOT EXISTS` así que es completamente seguro. Se ejecuta sin problemas.

**P: ¿Dónde ver los logs?**  
R: Railway → Servicio → Logs. Busca líneas con `[v0]`.

**P: ¿Se ejecuta cada vez que deploy?**  
R: Sí, pero como usa `IF NOT EXISTS`, no causa problemas.

---

Para más detalles sobre Railway, ver: https://docs.railway.app/guides/databases
