# Español

# GestionDeRestaurantes

## Descripción

Sistema de gestión de restaurantes full-stack para la administración de pedidos, gestión del menú y reservas, desarrollado con React, Node.js, .NET y Docker, siguiendo la metodología ágil SCRUM.

## Funcionalidades Principales

### Autenticación y Autorización

* Registro de usuarios
* Inicio de sesión con JWT
* Protección de rutas con JWT Bearer Authentication
* Sistema de roles
* Control de acceso basado en roles
* Cierre de sesión seguro

### Gestión de Usuarios

* Consulta de usuarios por ID
* Listado de usuarios con paginación
* Activación / desactivación de cuentas
* Gestión de roles y permisos

### Gestión de Menú

* Creación, edición y eliminación de platos
* Gestión de categorías
* Administración de precios
* Control de disponibilidad (activo / agotado)
* Carga de imágenes de productos
* Búsqueda de platos

### Gestión de Órdenes

* Creación de órdenes en tiempo real
* Asociación de órdenes a mesas o clientes
* Actualización de estado de orden
* Cálculo automático del total
* Historial de órdenes
* Generación de factura

### Gestión de Reservaciones

* Creación de reservaciones con fecha y hora
* Asignación de mesas
* Validación de disponibilidad
* Confirmación o cancelación de reservaciones
* Historial de reservaciones por cliente

### Gestión de Mesas

* Registro de mesas
* Estado de mesa
* Capacidad por mesa
* Asignación automática/manual

### Seguridad

* Tokens JWT con expiración
* Validación de datos en backend
* Middleware global de manejo de errores
* Rate limiting en endpoints críticos

## Tecnologías Utilizadas

### Backend

* **Framework**: ASP.NET Core 8.0
* **Lenguaje**: C# (.NET 8)
* **Arquitectura**: Clean Architecture (4 capas)

### Base de Datos

* **ORM**: Entity Framework Core 9.0
* **Base de Datos**: PostgreSQL y MongoDB
* **Migraciones**: EF Core Migrations
* **Naming Convention**: Snake case

### Seguridad

* **JWT**: System.IdentityModel.Tokens.Jwt
* **Hashing**: Argon2 (Konscious.Security.Cryptography.Argon2)
* **Authentication**: Microsoft.AspNetCore.Authentication.JwtBearer
* **Headers**: NetEscapades.AspNetCore.SecurityHeaders

### Servicios Externos

* **Email**: MailKit (SMTP)

### Validación y Logging

* **Validación**: FluentValidation
* **Logging**: Serilog.AspNetCore

## Endpoints API

Base URL: `http://localhost:5126/api/v1`


---

## Autenticación (/auth)

| Método | Ruta                        | Descripción                              | Auth |
|--------|----------------------------|------------------------------------------|------|
| POST   | /auth/register             | Registrar nuevo usuario                  | No   |
| POST   | /auth/login                | Iniciar sesión                           | No   |
| POST   | /auth/verify-email         | Verificar correo electrónico             | No   |

---

## Salud (/health)

| Método | Ruta     | Descripción           | Auth |
|--------|----------|----------------------|------|
| GET    | /health  | Estado del servicio  | No   |

## Modelos de Request

### Registro (/auth/register)

```json
{
  "Name": "Xavier",
  "Surname": "Portillo",
  "username": "xportillo",
  "email": "usuario@ejemplo.com",
  "password": "Contraseña123!",
  "phone": "12345678"
}
```

### Login (/auth/login)

```json
{
    "EmailOrUsername":"testadmin",
    "Password":"Test123!"
}
```

### Verificación de Email (/auth/verify-email)

```json
{
    "Token" : "wlWVrfkpyqObhAjkCVj0dpu9CJjxPzg6FqWrX3f9Xa0"
}
```

## 📁 Estructura del Proyecto

```
FoodPilot/
│
├── src/                          # Código fuente principal
│   ├── config/                   # Configuración de base de datos
│   │   └── db.js
│   │
│   ├── controllers/              # Controladores de la aplicación
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   └── reservationController.js
│   │
│   ├── middleware/               # Middlewares personalizados
│   │   └── authMiddleware.js
│   │
│   ├── models/                   # Modelos de datos (MongoDB / Mongoose)
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   ├── Reservation.js
│   │   └── User.js
│   │
│   ├── routes/                   # Definición de rutas API
│   │   ├── authRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── orderRoutes.js
│   │   └── reservationRoutes.js
│   │
│   └── app.js                    # Configuración principal de Express
│
├── node_modules/                 # Dependencias instaladas
├── .env                          # Variables de entorno
├── package.json                  # Dependencias y scripts del proyecto
├── package-lock.json             # Versionado exacto de dependencias
└── server.js                     # Punto de entrada del servidor
```

## Configuración

### Requisitos Previos

* MongoDB
* PostgreSQL 13 o superior
* Docker (opcional)
* Git
* Cuenta de Gmail

### Variables de Configuración

Crear appsettings.Development.json en src/AuthService.Api/:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=foodpilot;Username=FOODPILOT;Password=FoodPilot2026?;Port=5437"
  }, 
  "JwtSettings": {
    "SecretKey": "E$3cr3tK3yF0rK1n4lSp0rts@In6am2026",
    "Issuer": "FoodPilot",
    "Audience": "FoodPilot",
    "ExpirationMinutes": 60
  },
  "SmtpSettings":{
    "Host":"smtp.gmail.com",
    "Port":"465",
    "EnableSsl":"true",
    "Username":"official.hexacodee@gmail.com",
    "Password":"bogo pufu dyko lxke",
    "FromEmail":"official.hexacodee@gmail.com",
    "FromName":"FoodPilot Soporte",
    "Enabled":true,
    "Timeout":10000,
    "UseFallback":false,
    "UseImplicitSsl":true,
    "IgnoreCertificateErrors": true
  },
  "AppSettings":{
    "FrontendUrl": "http://localhost3000"
  },
  "Security": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://localhost:3000",
      "https://localhost:3001"
    ],
    "AdminAllowedOrigins": [
      "http://localhost:3000"
    ],
    "BlacklistedIPs": [],
    "WhitelistedIPs": [],
    "RestrictedPaths": []
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Serilog": {
    "Using": ["Serilog.Sinks.Console", "Serilog.Sinks.File"],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.AspNetCore": "Warning",
        "Microsoft.Hosting.Lifetime": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/auth-service-.txt",
          "rollingInterval": "Day",
          "outputTemplate": "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}",
          "retainedFileCountLimit": 30
        }
      }
    ],
    "Enrich": ["FromLogContext"]
  },
  "AllowedHosts": "*"
}
```

## Instalación y Ejecución

### 1️⃣ Clonar el repositorio

```bash
git clone <url-repositorio>
cd auth-service
```

---

### 2️⃣ Restaurar dependencias

```bash
dotnet restore
```

---

### 3️⃣ Aplicar migraciones a la base de datos

```bash
cd src/AuthService.Api
dotnet ef database update
```

---

### 4️⃣ Ejecutar el servicio

```bash
dotnet run
```

El servicio estará disponible en: `http://localhost:5126/api/v1`


## Créditos

Este proyecto incluye partes de código de KinalSports, específicamente el servicio de autenticación (registro e inicio de sesión de usuarios),
creado por Braulio Echeverría.

Repositorio: https://github.com/IN6AMProm33/auth-service-dotnet.git

## Licencia

Licencia MIT



# English

# GestionDeRestaurantes


## Description

Full-stack restaurant management system for handling orders, menu administration, and reservations, developed with React, Node.js, .NET, and Docker, following the SCRUM agile methodology.

## Main Features

### Authentication & Authorization

* User registration
* JWT login
* Route protection with JWT Bearer Authentication
* Role-based system
* Role-based access control
* Secure logout

### User Management

* Get user by ID
* Paginated user listing
* Account activation / deactivation
* Role and permission management

### Menu Management

* Create, update, and delete dishes
* Category management
* Price management
* Availability control (active / out of stock)
* Product image upload
* Dish search

### Order Management

* Real-time order creation
* Assign orders to tables or customers
* Order status updates
* Automatic total calculation
* Order history
* Invoice generation

### Reservation Management

* Create reservations with date and time
* Table assignment
* Availability validation
* Reservation confirmation or cancellation
* Reservation history per customer

### Table Management

* Table registration
* Table status management
* Table capacity
* Automatic/manual assignment

### Security

* JWT tokens with expiration
* Backend data validation
* Global error handling middleware
* Rate limiting on critical endpoints

## Technologies Used

### Backend

* **Framework**: ASP.NET Core 8.0
* **Language**: C# (.NET 8)
* **Architecture**: Clean Architecture (4 layers)

### Database

* **ORM**: Entity Framework Core 9.0
* **Database**: PostgreSQL and MongoDB
* **Migrations**: EF Core Migrations
* **Naming Convention**: Snake case

### Security

* **JWT**: System.IdentityModel.Tokens.Jwt
* **Hashing**: Argon2 (Konscious.Security.Cryptography.Argon2)
* **Authentication**: Microsoft.AspNetCore.Authentication.JwtBearer
* **Headers**: NetEscapades.AspNetCore.SecurityHeaders

### External Services

* **Email**: MailKit (SMTP)

### Validation and Logging

* **Validation**: FluentValidation
* **Logging**: Serilog.AspNetCore

## API Endpoints

Base URL: `http://localhost:5126/api/v1`

---

## Authentication (/auth)

| Method | Route                       | Description                | Auth |
|--------|----------------------------|----------------------------|------|
| POST   | /auth/register             | Register new user          | No   |
| POST   | /auth/login                | Login                      | No   |
| POST   | /auth/verify-email         | Verify email               | No   |

---

## Health (/health)

| Method | Route    | Description          | Auth |
|--------|----------|----------------------|------|
| GET    | /health  | Service status       | No   |

## Request Models

### Register (/auth/register)

```json
{
  "Name": "Xavier",
  "Surname": "Portillo",
  "username": "xportillo",
  "email": "usuario@ejemplo.com",
  "password": "Contraseña123!",
  "phone": "12345678"
}
```

### Login (/auth/login)

```json
{
  "EmailOrUsername": "testadmin",
  "Password": "Test123!"
}
```

### Email Verification (/auth/verify-email)

```json
{
  "Token": "wlWVrfkpyqObhAjkCVj0dpu9CJjxPzg6FqWrX3f9Xa0"
}
```

## 📁 Project Structure

```
FoodPilot/
│
├── src/                          # Main source code
│   ├── config/                   # Database configuration
│   │   └── db.js
│   │
│   ├── controllers/              # Application controllers
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   └── reservationController.js
│   │
│   ├── middleware/               # Custom middlewares
│   │   └── authMiddleware.js
│   │
│   ├── models/                   # Data models (MongoDB / Mongoose)
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   ├── Reservation.js
│   │   └── User.js
│   │
│   ├── routes/                   # API route definitions
│   │   ├── authRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── orderRoutes.js
│   │   └── reservationRoutes.js
│   │
│   └── app.js                    # Express main configuration
│
├── node_modules/                 # Installed dependencies
├── .env                          # Environment variables
├── package.json                  # Project dependencies and scripts
├── package-lock.json             # Exact dependency versions
└── server.js                     # Server entry point
```

## Configuration

### Prerequisites

* MongoDB
* PostgreSQL 13 or higher
* Docker (optional)
* Git
* Gmail account

### Configuration Variables

Create `appsettings.Development.json` inside `src/AuthService.Api/`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=foodpilot;Username=FOODPILOT;Password=FoodPilot2026?;Port=5437"
  },
  "JwtSettings": {
    "SecretKey": "E$3cr3tK3yF0rK1n4lSp0rts@In6am2026",
    "Issuer": "FoodPilot",
    "Audience": "FoodPilot",
    "ExpirationMinutes": 60
  },
  "SmtpSettings": {
    "Host": "smtp.gmail.com",
    "Port": "465",
    "EnableSsl": "true",
    "Username": "official.hexacodee@gmail.com",
    "Password": "bogo pufu dyko lxke",
    "FromEmail": "official.hexacodee@gmail.com",
    "FromName": "FoodPilot Support",
    "Enabled": true,
    "Timeout": 10000,
    "UseFallback": false,
    "UseImplicitSsl": true,
    "IgnoreCertificateErrors": true
  },
  "AppSettings": {
    "FrontendUrl": "http://localhost3000"
  },
  "Security": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://localhost:3000",
      "https://localhost:3001"
    ],
    "AdminAllowedOrigins": [
      "http://localhost:3000"
    ],
    "BlacklistedIPs": [],
    "WhitelistedIPs": [],
    "RestrictedPaths": []
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Serilog": {
    "Using": ["Serilog.Sinks.Console", "Serilog.Sinks.File"],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.AspNetCore": "Warning",
        "Microsoft.Hosting.Lifetime": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console"
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/auth-service-.txt",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30
        }
      }
    ],
    "Enrich": ["FromLogContext"]
  },
  "AllowedHosts": "*"
}
```

## Installation & Execution

### 1️⃣ Clone the repository

```bash
git clone <repository-url>
cd auth-service
```

---

### 2️⃣ Restore dependencies

```bash
dotnet restore
```

---

### 3️⃣ Apply database migrations

```bash
cd src/AuthService.Api
dotnet ef database update
```

---

### 4️⃣ Run the service

```bash
dotnet run
```

The service will be available at: `http://localhost:5126/api/v1`

## Credits

This project includes portions of code from KinalSports, specifically the authentication service (user registration and login),
created by Braulio Echeverría.

Repository: https://github.com/IN6AMProm33/auth-service-dotnet.git

## License

MIT License
