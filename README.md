# Sistema de Gestión de Números de Rifa

Una aplicación web completa para registrar, buscar, editar y eliminar números de rifa con autenticación segura.

## Características

✅ **Autenticación segura** con JWT y contraseñas hasheadas
✅ **Base de datos MySQL** para almacenamiento persistente
✅ **CRUD completo** para números de rifa
✅ **Búsqueda avanzada** de números
✅ **Interfaz moderna** con shadcn/ui
✅ **Responsive design** para cualquier dispositivo

## Requisitos Previos

- **Node.js** 18+ y **pnpm**
- **MySQL** 5.7+ instalado y ejecutándose
- Variables de entorno configuradas

## Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd sistema-rifa
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar la base de datos

#### Opción A: Ejecutar el script SQL directamente

```bash
# Accede a MySQL
mysql -u root -p

# En la consola de MySQL, ejecuta:
source database/init.sql
```

#### Opción B: Usar un cliente MySQL

1. Abre tu cliente MySQL favorito (MySQL Workbench, phpMyAdmin, etc.)
2. Abre y ejecuta el archivo `database/init.sql`

### 4. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local

# Editar .env.local con tus credenciales:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=rifa_db
JWT_SECRET=tu_clave_secreta_aqui
NODE_ENV=development
```

### 5. Ejecutar la aplicación

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
├── app/
│   ├── page.tsx                 # Página de login
│   ├── register/                # Página de registro
│   ├── dashboard/               # Dashboard principal
│   ├── api/
│   │   ├── auth/                # Rutas de autenticación
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── logout/
│   │   └── rifas/               # Rutas de gestión de rifas
│   │       ├── route.ts         # GET, POST
│   │       ├── [id]/            # PUT, DELETE
│   │       └── search/          # Búsqueda
│   └── globals.css
├── components/
│   ├── auth-form.tsx            # Componente de login/registro
│   └── rifa-manager.tsx         # Componente de gestión de rifas
├── lib/
│   ├── db.ts                    # Conexión a MySQL
│   ├── auth.ts                  # Funciones de autenticación
│   └── types.ts                 # Tipos TypeScript
├── database/
│   └── init.sql                 # Script de inicialización
└── .env.example                 # Variables de entorno
```

## Uso

### 1. Registrarse

- Accede a `http://localhost:3000/register`
- Completa el formulario con usuario, email y contraseña
- Haz clic en "Registrarse"

### 2. Iniciar sesión

- Ve a `http://localhost:3000`
- Ingresa tu usuario y contraseña
- Serás redirigido al dashboard

### 3. Gestionar números de rifa

En el dashboard puedes:

- **Agregar**: Registra nuevos números con descripción opcional
- **Buscar**: Encuentra números rápidamente
- **Editar**: Modifica números y descripciones existentes
- **Eliminar**: Borra números que ya no necesites

## API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Números de Rifa

- `GET /api/rifas` - Listar todos los números del usuario
- `POST /api/rifas` - Crear nuevo número
- `PUT /api/rifas/[id]` - Actualizar número
- `DELETE /api/rifas/[id]` - Eliminar número
- `GET /api/rifas/search?q=query` - Buscar números

## Seguridad

- ✅ Contraseñas hasheadas con bcryptjs
- ✅ JWT para autenticación stateless
- ✅ Cookies HTTP-only para almacenar tokens
- ✅ Validación en servidor y cliente
- ✅ Aislamiento de datos por usuario

## Solución de Problemas

### Error de conexión a MySQL

```
Error: connect ECONNREFUSED
```

**Solución**: Verifica que MySQL esté ejecutándose y que las credenciales en `.env.local` sean correctas.

### Error: "Token inválido"

Limpia las cookies del navegador y vuelve a iniciar sesión.

### Base de datos no existe

Asegúrate de ejecutar el script `database/init.sql` antes de iniciar la aplicación.

## Desarrollo

### Agregar nuevas funcionalidades

1. Crea rutas API en `app/api/`
2. Crea componentes en `components/`
3. Actualiza `lib/types.ts` si es necesario

### Testing

```bash
pnpm build  # Compilar
pnpm dev    # Desarrollo con hot reload
```

## Despliegue

### 🚂 Despliegue en Railway (Recomendado - Automático)

Railway es la forma más fácil de desplegar esta aplicación. La base de datos se crea **completamente automática**.

**Pasos rápidos:**
1. Sube tu código a GitHub
2. Ve a [railway.app](https://railway.app) y crea un nuevo proyecto
3. Conecta tu repositorio de GitHub
4. Agrega una Base de Datos MySQL (Railway lo configura automáticamente)
5. ¡Eso es! Las migraciones y datos de prueba se crean automáticamente

**Para documentación detallada:** Ver [RAILWAY_SETUP.md](./RAILWAY_SETUP.md)

### Vercel

Para desplegar en Vercel:

1. Sube tu código a GitHub
2. Conecta el repositorio en Vercel
3. Configura las variables de entorno en Vercel
4. Asegúrate de tener una base de datos MySQL accesible

## Licencia

Este proyecto está disponible bajo la licencia MIT.

## Soporte

Si encuentras problemas, abre un issue en el repositorio.
