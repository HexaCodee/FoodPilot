# Documentación Swagger - FoodPilot Authentication Service

## Descripción General

El servicio de autenticación de FoodPilot está completamente documentado con **Swagger/OpenAPI 3.0**. Esta documentación facilita:

- Exploración interactiva de endpoints
- Pruebas de APIs directamente desde el navegador
- Generación automática de clientes
- Comprensión clara de los tipos de datos y respuestas

---

## Acceso a la Documentación

### Desarrollo Local

Una vez que ejecutes el servicio en modo desarrollo, accede a:

```
http://localhost:5000/swagger/index.html
```

### Alternativas

- **Swagger JSON**: `http://localhost:5000/swagger/v1/swagger.json`
- **Redoc UI** (alternativa a Swagger UI): `http://localhost:5000/api-docs/`

---

## Endpoints Documentados

### Authentication (`/api/v1/auth`)

#### 1. **POST /login**
Autentica un usuario y devuelve un JWT token.

- **Rate Limiting**: 5 intentos por minuto (`AuthPolicy`)
- **Request Body**: `LoginDto`
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "refreshToken": "optional-refresh-token"
  }
  ```
- **Error Responses**:
  - `400`: Credenciales inválidas
  - `429`: Límite de rate limiting excedido
  - `500`: Error interno del servidor

---

#### 2. **POST /register**
Registra un nuevo usuario con verificación de email.

- **Rate Limiting**: 3 registros por hora (`AuthPolicy`)
- **Request Type**: `multipart/form-data` (requiere archivo)
- **Request Body**: `RegisterDto`
  ```
  {
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "profilePhoto": <file> (máximo 10MB)
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "email": "newuser@example.com",
    "message": "Registro exitoso. Por favor verifica tu email.",
    "verificationEmailSent": true
  }
  ```
- **Error Responses**:
  - `400`: Datos incompletos o inválidos
  - `409`: Email ya registrado
  - `413`: Archivo de foto excede 10MB
  - `429`: Límite de rate limiting excedido
  - `500`: Error interno del servidor

---

#### 3. **POST /verify-email**
Verifica el email del usuario usando el token enviado al email.

- **Rate Limiting**: Estándar (`ApiPolicy`)
- **Request Body**: `VerifyEmailDto`
  ```json
  {
    "email": "user@example.com",
    "verificationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "email": "user@example.com",
    "message": "Email verificado exitosamente.",
    "verified": true
  }
  ```
- **Error Responses**:
  - `400`: Token inválido o expirado
  - `404`: Usuario no encontrado
  - `409`: Email ya verificado
  - `429`: Límite de rate limiting excedido
  - `500`: Error interno del servidor

---

### Health (`/api/v1/health`)

#### **GET /** 
Verifica el estado actual del servicio.

- **No requiere autenticación**
- **Response** (200 OK):
  ```json
  {
    "status": "Healthy",
    "timestamp": "2025-04-13T10:30:45.123z",
    "service": "FoodPilot AuthService"
  }
  ```
- **Uso**: 
  - Load balancers
  - Monitoreo del servicio
  - Health checks de Docker
  - Verificación de conectividad

---

## Autenticación Bearer Token

La mayoría de endpoints que requieren autenticación esperan un **JWT Bearer Token** en el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### En Swagger UI:

1. Haz clic en el botón **"Authorize"** (arriba a la derecha)
2. Escribe: `Bearer <tu-token-jwt>`
3. Haz clic en "Authorize"
4. Los endpoints protegidos estarán disponibles

---

## Rate Limiting

El servicio implementa dos políticas de rate limiting:

| Política | Límite | Endpoints |
|----------|--------|-----------|
| **AuthPolicy** | 5 por minuto | `/login`, `/register` |
| **ApiPolicy** | 10 por minuto | `/verify-email`, demás endpoints |

**Respuesta cuando se excede el límite** (429 Too Many Requests):
```json
{
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```

---

## Estructura de Respuestas de Error

Todos los errores siguen un formato consistente:

```json
{
  "type": "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "traceId": "0HMVK4E9I9DPM:00000001",
  "errors": {
    "email": ["El email es requerido"],
    "password": ["La contraseña debe tener al menos 8 caracteres"]
  }
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Login y obtener Token

```bash
curl -X POST "http://localhost:5000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**Respuesta:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

---

### Ejemplo 2: Registrar nuevo usuario

```bash
curl -X POST "http://localhost:5000/api/v1/auth/register" \
  -F "email=newuser@example.com" \
  -F "password=SecurePassword123!" \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "profilePhoto=@/path/to/photo.jpg"
```

---

### Ejemplo 3: Verificar email

```bash
curl -X POST "http://localhost:5000/api/v1/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "verificationToken": "token-from-email"
  }'
```

---

### Ejemplo 4: Usar Token para endpoint protegido

```bash
curl -X GET "http://localhost:5000/api/v1/protected-endpoint" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## DTOs Principales

### **LoginDto**
```json
{
  "email": "string (email válido)",
  "password": "string (8+ caracteres)"
}
```

### **RegisterDto** (multipart/form-data)
```
email: string (email válido, único)
password: string (8+ caracteres con mayúscula, número y símbolo)
firstName: string (2-50 caracteres)
lastName: string (2-50 caracteres)
profilePhoto: file (máximo 10MB, PNG/JPEG)
```

### **VerifyEmailDto**
```json
{
  "email": "string (email válido)",
  "verificationToken": "string (JWT token)"
}
```

### **AuthResponseDto**
```json
{
  "userId": "string (GUID)",
  "email": "string",
  "token": "string (JWT)",
  "expiresIn": "integer (segundos)",
  "refreshToken": "string (opcional)"
}
```

---

## Configuración de Swagger (Código)

La configuración de Swagger está definida en:
- [ServiceCollectionExtensions.cs](Authentication-service/auth-service/src/AuthService.Api/Extensions/ServiceCollectionExtensions.cs) - Configuración principal
- Controladores - Atributos de documentación

### Características habilitadas:

- Información de la API con contacto
- Esquema de seguridad Bearer JWT
- Comentarios XML de métodos
- Tipos de respuesta documentados
- Ejemplos de DTOs
- Validaciones de entrada

---

## Próximos Pasos

Para mejorar aún más la documentación:

1. **Agregar ejemplos de respuestas** en Swagger UI
2. **Documentar DTOs** con atributos `[Description]`
3. **Agregar colecciones Postman** (disponible en Swagger)
4. **Implementar versionamiento de API** (`/api/v2/...`)
5. **Agregar webhooks** a la documentación si aplica

---

## Referencias Útiles

- Documentación oficial Swashbuckle
- OpenAPI 3.0 Specification
- JWT.io - Información sobre JWT

---

**Última actualización**: 13 de abril de 2025
**Versión de Swagger**: OpenAPI 3.0
**Versión de .NET**: 8.0
