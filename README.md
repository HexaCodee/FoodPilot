# Español

# FoodPilot — Plataforma de Gestión de Restaurantes

Sistema web integral para la gestión de restaurantes, desarrollado con una arquitectura de microservicios. Permite administrar restaurantes, mesas, menús, pedidos, reservaciones y eventos, con vistas diferenciadas según el rol del usuario.

## Arquitectura

```
FoodPilot/
├── Authentication-service/     # Autenticación y autorización (.NET 8 / PostgreSQL)
├── restaurant-admin/           # Gestión de restaurantes, mesas y menús (Node.js / MongoDB)
├── event-service/              # Gestión de eventos y reportes (Node.js / MongoDB)
├── order-tracking-api/         # Pedidos y reservaciones (Node.js / MongoDB)
├── client-admin/               # Frontend (React + Vite + Tailwind CSS)
└── pg/                         # Docker Compose para PostgreSQL
```

## Roles del sistema

| Rol | Descripción |
|-----|-------------|
| `PLATFORM_ADMIN` | Administrador de la plataforma: gestiona usuarios, restaurantes y reportes globales |
| `RESTAURANT_ADMIN` | Administrador de restaurante: gestiona su propio establecimiento, menú, mesas y pedidos |
| `CLIENT` | Cliente: busca restaurantes, hace reservaciones y realiza pedidos |

## Tecnologías

| Servicio | Lenguaje | Framework | Base de datos | Puerto |
|----------|----------|-----------|---------------|--------|
| Authentication-service | C# | ASP.NET Core 8 | PostgreSQL | 5126 |
| restaurant-admin | JavaScript | Express 5 | MongoDB | 3020 |
| event-service | JavaScript | Express 5 | MongoDB | (ver .env) |
| order-tracking-api | JavaScript | Express | MongoDB | 3000 |
| client-admin | JavaScript | React + Vite | — | 5173 |

---

## Requisitos previos

- Node.js 18 o superior
- .NET SDK 8.0
- PostgreSQL 13 o superior (o Docker)
- MongoDB 6 o superior
- pnpm (`npm install -g pnpm`)
- Git

---

## Configuración

> **Importante:** ningún archivo `.env` ni `appsettings.json` se incluye en el repositorio por seguridad. Debes crear cada uno a partir de su respectivo archivo `.example`.

### 1. Authentication-service

Copia el archivo de ejemplo y completa tus valores:

```bash
cp Authentication-service/auth-service/src/AuthService.Api/appsettings.example.json \
   Authentication-service/auth-service/src/AuthService.Api/appsettings.json
```

Edita `appsettings.json` y reemplaza los siguientes campos:

| Campo | Descripción |
|-------|-------------|
| `ConnectionStrings.DefaultConnection` | Cadena de conexión a PostgreSQL (host, database, username, password, port) |
| `JwtSettings.SecretKey` | Clave secreta para firmar tokens JWT (mínimo 32 caracteres) |
| `SmtpSettings.Username` | Tu correo de Gmail |
| `SmtpSettings.Password` | Tu App Password de Google (no tu contraseña normal) |
| `SmtpSettings.FromEmail` | Mismo correo de Gmail |
| `AppSettings.FrontendUrl` | URL del frontend, por defecto `http://localhost:5173` |

> Para generar una App Password de Google: [Cuenta de Google → Seguridad → Contraseñas de aplicaciones](https://myaccount.google.com/apppasswords) (requiere verificación en dos pasos activa).

---

### 2. restaurant-admin

```bash
cp restaurant-admin/.env.example restaurant-admin/.env
```

Edita `restaurant-admin/.env`:

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (por defecto: `3020`) |
| `URI_MONGODB` | URI de conexión a MongoDB |
| `JWT_SECRET` | Clave secreta JWT (debe coincidir con la del auth service) |
| `JWT_ISSUER` | Emisor del token (por defecto: `FoodPilot`) |
| `JWT_AUDIENCE` | Audiencia del token (por defecto: `FoodPilot`) |
| `JWT_EXPIRES_IN` | Tiempo de expiración (por defecto: `1h`) |

---

### 3. event-service

```bash
cp event-service/.env.example event-service/.env   # si existe, si no créalo manualmente
```

Variables requeridas: `PORT`, `URI_MONGODB`, `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`.

---

### 4. order-tracking-api

Variables requeridas: `PORT`, `URI_MONGODB`. Crea un archivo `.env` en la raíz del servicio.

---

### 5. client-admin (frontend)

```bash
cp client-admin/.env.example client-admin/.env
```

Edita `client-admin/.env`:

| Variable | Valor por defecto |
|----------|-------------------|
| `VITE_AUTH_URL` | `http://localhost:5126/api/v1` |
| `VITE_ADMIN_URL` | `http://localhost:3020/restaurantAdmin/v1` |

---

## Instalación y ejecución

### Authentication-service

```bash
cd Authentication-service/auth-service

# Restaurar dependencias
dotnet restore

# Aplicar migraciones (primera vez)
cd src/AuthService.Api
dotnet ef database update

# Ejecutar
dotnet run
```

Disponible en: `http://localhost:5126`  
Swagger: `http://localhost:5126/swagger`

---

### restaurant-admin

```bash
cd restaurant-admin
pnpm install
pnpm start   # o: node index.js
```

Disponible en: `http://localhost:3020`  
Swagger: `http://localhost:3020/api-docs`

---

### event-service

```bash
cd event-service
pnpm install
pnpm start
```

Swagger: `http://localhost:{PORT}/api-docs`

---

### order-tracking-api

```bash
cd order-tracking-api
npm install
node index.js
```

Disponible en: `http://localhost:3000`  
Swagger: `http://localhost:3000/api-docs`

---

### client-admin (frontend)

```bash
cd client-admin
pnpm install
pnpm dev
```

Disponible en: `http://localhost:5173`

---

## Endpoints API

### Authentication-service — `http://localhost:5126/api/v1`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Registrar usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/verify-email` | Verificar correo | No |
| POST | `/auth/forgot-password` | Solicitar recuperación de contraseña | No |
| POST | `/auth/reset-password` | Restablecer contraseña | No |
| GET | `/health` | Estado del servicio | No |

### restaurant-admin — `http://localhost:3020/restaurantAdmin/v1`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/restaurants` | Crear restaurante |
| GET | `/restaurants` | Listar restaurantes |
| GET | `/restaurants/:id` | Obtener restaurante |
| PUT | `/restaurants/:id` | Actualizar restaurante |
| PATCH | `/restaurants/:id/activate` | Activar restaurante |
| PATCH | `/restaurants/:id/deactivate` | Desactivar restaurante |
| POST | `/menus` | Crear plato |
| GET | `/menus` | Listar platos |
| PUT | `/menus/:id` | Actualizar plato |
| PATCH | `/menus/:id/activate` | Activar plato |
| PATCH | `/menus/:id/deactivate` | Desactivar plato |
| POST | `/tables` | Crear mesa |
| GET | `/tables` | Listar mesas |
| PUT | `/tables/:id` | Actualizar mesa |
| PATCH | `/tables/:id/activate` | Activar mesa |
| PATCH | `/tables/:id/deactivate` | Desactivar mesa |

### event-service — `http://localhost:{PORT}/eventService/v1`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST/GET/PUT/DELETE | `/events` | CRUD de eventos |
| POST/GET/PUT/DELETE | `/sales-reports` | CRUD de reportes de ventas |
| POST/GET/PUT/DELETE | `/usage-stats` | CRUD de estadísticas de uso |

### order-tracking-api — `http://localhost:3000/api`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/orders` | Crear pedido |
| GET | `/orders` | Listar pedidos |
| GET | `/orders/:id` | Obtener pedido |
| PUT | `/orders/:id/status` | Actualizar estado del pedido |
| POST | `/reservations` | Crear reservación |
| GET | `/reservations` | Listar reservaciones |
| GET | `/reservations/:id` | Obtener reservación |
| PUT | `/reservations/:id/cancel` | Cancelar reservación |
| PUT | `/reservations/:id/complete` | Completar reservación |

---

## Créditos

Este proyecto incluye partes de código de KinalSports, específicamente el servicio de autenticación (registro e inicio de sesión de usuarios), creado por Braulio Echeverría.

Repositorio: https://github.com/IN6AMProm33/auth-service-dotnet.git

---

## Licencia

MIT License

---
---

# English

# FoodPilot — Restaurant Management Platform

A full-stack web platform for managing restaurants, built with a microservices architecture. It supports restaurant, table, menu, order, reservation, and event management, with role-based views for each user type.

## Architecture

```
FoodPilot/
├── Authentication-service/     # Auth & authorization (.NET 8 / PostgreSQL)
├── restaurant-admin/           # Restaurant, table & menu management (Node.js / MongoDB)
├── event-service/              # Events & reports (Node.js / MongoDB)
├── order-tracking-api/         # Orders & reservations (Node.js / MongoDB)
├── client-admin/               # Frontend (React + Vite + Tailwind CSS)
└── pg/                         # Docker Compose for PostgreSQL
```

## User Roles

| Role | Description |
|------|-------------|
| `PLATFORM_ADMIN` | Platform administrator: manages users, restaurants, and global reports |
| `RESTAURANT_ADMIN` | Restaurant admin: manages their own establishment, menu, tables, and orders |
| `CLIENT` | Customer: browses restaurants, makes reservations, and places orders |

## Technologies

| Service | Language | Framework | Database | Port |
|---------|----------|-----------|----------|------|
| Authentication-service | C# | ASP.NET Core 8 | PostgreSQL | 5126 |
| restaurant-admin | JavaScript | Express 5 | MongoDB | 3020 |
| event-service | JavaScript | Express 5 | MongoDB | (see .env) |
| order-tracking-api | JavaScript | Express | MongoDB | 3000 |
| client-admin | JavaScript | React + Vite | — | 5173 |

---

## Prerequisites

- Node.js 18 or higher
- .NET SDK 8.0
- PostgreSQL 13 or higher (or Docker)
- MongoDB 6 or higher
- pnpm (`npm install -g pnpm`)
- Git

---

## Configuration

> **Important:** no `.env` or `appsettings.json` files are included in the repository for security reasons. You must create each one from its respective `.example` file.

### 1. Authentication-service

Copy the example file and fill in your values:

```bash
cp Authentication-service/auth-service/src/AuthService.Api/appsettings.example.json \
   Authentication-service/auth-service/src/AuthService.Api/appsettings.json
```

Edit `appsettings.json` and replace the following fields:

| Field | Description |
|-------|-------------|
| `ConnectionStrings.DefaultConnection` | PostgreSQL connection string (host, database, username, password, port) |
| `JwtSettings.SecretKey` | Secret key for signing JWT tokens (minimum 32 characters) |
| `SmtpSettings.Username` | Your Gmail address |
| `SmtpSettings.Password` | Your Google App Password (not your regular password) |
| `SmtpSettings.FromEmail` | Same Gmail address |
| `AppSettings.FrontendUrl` | Frontend URL, default `http://localhost:5173` |

> To generate a Google App Password: [Google Account → Security → App Passwords](https://myaccount.google.com/apppasswords) (requires 2-Step Verification to be enabled).

---

### 2. restaurant-admin

```bash
cp restaurant-admin/.env.example restaurant-admin/.env
```

Edit `restaurant-admin/.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `3020`) |
| `URI_MONGODB` | MongoDB connection URI |
| `JWT_SECRET` | JWT secret key (must match the auth service) |
| `JWT_ISSUER` | Token issuer (default: `FoodPilot`) |
| `JWT_AUDIENCE` | Token audience (default: `FoodPilot`) |
| `JWT_EXPIRES_IN` | Expiration time (default: `1h`) |

---

### 3. event-service

```bash
cp event-service/.env.example event-service/.env   # if it exists, otherwise create it manually
```

Required variables: `PORT`, `URI_MONGODB`, `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`.

---

### 4. order-tracking-api

Required variables: `PORT`, `URI_MONGODB`. Create a `.env` file in the service root.

---

### 5. client-admin (frontend)

```bash
cp client-admin/.env.example client-admin/.env
```

Edit `client-admin/.env`:

| Variable | Default value |
|----------|---------------|
| `VITE_AUTH_URL` | `http://localhost:5126/api/v1` |
| `VITE_ADMIN_URL` | `http://localhost:3020/restaurantAdmin/v1` |

---

## Installation & Running

### Authentication-service

```bash
cd Authentication-service/auth-service

# Restore dependencies
dotnet restore

# Apply migrations (first time only)
cd src/AuthService.Api
dotnet ef database update

# Run
dotnet run
```

Available at: `http://localhost:5126`  
Swagger: `http://localhost:5126/swagger`

---

### restaurant-admin

```bash
cd restaurant-admin
pnpm install
pnpm start
```

Available at: `http://localhost:3020`  
Swagger: `http://localhost:3020/api-docs`

---

### event-service

```bash
cd event-service
pnpm install
pnpm start
```

Swagger: `http://localhost:{PORT}/api-docs`

---

### order-tracking-api

```bash
cd order-tracking-api
npm install
node index.js
```

Available at: `http://localhost:3000`  
Swagger: `http://localhost:3000/api-docs`

---

### client-admin (frontend)

```bash
cd client-admin
pnpm install
pnpm dev
```

Available at: `http://localhost:5173`

---

## API Endpoints

### Authentication-service — `http://localhost:5126/api/v1`

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/auth/register` | Register user | No |
| POST | `/auth/login` | Login | No |
| POST | `/auth/verify-email` | Verify email | No |
| POST | `/auth/forgot-password` | Request password recovery | No |
| POST | `/auth/reset-password` | Reset password | No |
| GET | `/health` | Service health check | No |

### restaurant-admin — `http://localhost:3020/restaurantAdmin/v1`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/restaurants` | Create restaurant |
| GET | `/restaurants` | List restaurants |
| GET | `/restaurants/:id` | Get restaurant |
| PUT | `/restaurants/:id` | Update restaurant |
| PATCH | `/restaurants/:id/activate` | Activate restaurant |
| PATCH | `/restaurants/:id/deactivate` | Deactivate restaurant |
| POST | `/menus` | Create menu item |
| GET | `/menus` | List menu items |
| PUT | `/menus/:id` | Update menu item |
| PATCH | `/menus/:id/activate` | Activate menu item |
| PATCH | `/menus/:id/deactivate` | Deactivate menu item |
| POST | `/tables` | Create table |
| GET | `/tables` | List tables |
| PUT | `/tables/:id` | Update table |
| PATCH | `/tables/:id/activate` | Activate table |
| PATCH | `/tables/:id/deactivate` | Deactivate table |

### event-service — `http://localhost:{PORT}/eventService/v1`

| Method | Route | Description |
|--------|-------|-------------|
| POST/GET/PUT/DELETE | `/events` | Events CRUD |
| POST/GET/PUT/DELETE | `/sales-reports` | Sales reports CRUD |
| POST/GET/PUT/DELETE | `/usage-stats` | Usage stats CRUD |

### order-tracking-api — `http://localhost:3000/api`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/orders` | Create order |
| GET | `/orders` | List orders |
| GET | `/orders/:id` | Get order |
| PUT | `/orders/:id/status` | Update order status |
| POST | `/reservations` | Create reservation |
| GET | `/reservations` | List reservations |
| GET | `/reservations/:id` | Get reservation |
| PUT | `/reservations/:id/cancel` | Cancel reservation |
| PUT | `/reservations/:id/complete` | Complete reservation |

---

## Credits

This project includes portions of code from KinalSports, specifically the authentication service (user registration and login), created by Braulio Echeverría.

Repository: https://github.com/IN6AMProm33/auth-service-dotnet.git

---

## License

MIT License
