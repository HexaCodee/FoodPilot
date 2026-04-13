// Archivo de documentación Swagger para AuthService API
// Este archivo define la especificación OpenAPI/Swagger para la API de autenticación
// Se puede usar para generar documentación o integrar con herramientas de API

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'FoodPilot AuthService API',
    version: '1.0.0',
    description: 'API para autenticación y gestión de usuarios en FoodPilot',
    contact: {
      name: 'FoodPilot Team',
      email: 'support@foodpilot.com'
    }
  },
  servers: [
    {
      url: 'https://localhost:5001',
      description: 'Servidor de desarrollo'
    },
    {
      url: 'https://api.foodpilot.com/auth',
      description: 'Servidor de producción'
    }
  ],
  components: {
    schemas: {
      LoginDto: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'Correo electrónico del usuario'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'Contraseña del usuario'
          }
        }
      },
      RegisterDto: {
        type: 'object',
        required: ['name', 'surname', 'username', 'email', 'password', 'phone'],
        properties: {
          name: {
            type: 'string',
            description: 'Nombre del usuario'
          },
          surname: {
            type: 'string',
            description: 'Apellido del usuario'
          },
          username: {
            type: 'string',
            description: 'Nombre de usuario único'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Correo electrónico'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'Contraseña'
          },
          phone: {
            type: 'string',
            description: 'Número de teléfono'
          }
        }
      },
      AuthResponseDto: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT token de autenticación'
          },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      },
      RegisterResponseDto: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Mensaje de confirmación'
          },
          userId: {
            type: 'string',
            description: 'ID del usuario creado'
          }
        }
      },
      VerifyEmailDto: {
        type: 'object',
        required: ['email', 'token'],
        properties: {
          email: {
            type: 'string',
            format: 'email'
          },
          token: {
            type: 'string',
            description: 'Token de verificación de email'
          }
        }
      },
      EmailResponseDto: {
        type: 'object',
        properties: {
          message: {
            type: 'string'
          },
          verified: {
            type: 'boolean'
          }
        }
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'Healthy'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          service: {
            type: 'string',
            example: 'FoodPilot AuthService'
          }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/api/v1/auth/login': {
      post: {
        summary: 'Iniciar sesión',
        description: 'Autentica a un usuario y devuelve un token JWT',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginDto'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Inicio de sesión exitoso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponseDto'
                }
              }
            }
          },
          400: {
            description: 'Credenciales inválidas'
          },
          429: {
            description: 'Demasiados intentos de login'
          }
        }
      }
    },
    '/api/v1/auth/register': {
      post: {
        summary: 'Registrar usuario',
        description: 'Registra un nuevo usuario en el sistema',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                $ref: '#/components/schemas/RegisterDto'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Usuario registrado exitosamente',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegisterResponseDto'
                }
              }
            }
          },
          400: {
            description: 'Datos inválidos o usuario ya existe'
          },
          429: {
            description: 'Demasiados intentos de registro'
          }
        }
      }
    },
    '/api/v1/auth/verify-email': {
      post: {
        summary: 'Verificar email',
        description: 'Verifica el email del usuario usando un token enviado por email',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/VerifyEmailDto'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Email verificado correctamente',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EmailResponseDto'
                }
              }
            }
          },
          400: {
            description: 'Token inválido o expirado'
          },
          429: {
            description: 'Demasiados intentos'
          }
        }
      }
    },
    '/api/v1/health': {
      get: {
        summary: 'Estado de salud',
        description: 'Devuelve el estado de salud del servicio AuthService',
        tags: ['Health'],
        responses: {
          200: {
            description: 'Servicio funcionando correctamente',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse'
                }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Endpoints para autenticación y registro de usuarios'
    },
    {
      name: 'Health',
      description: 'Endpoints para verificar el estado del servicio'
    }
  ]
};

// Exportar la definición para uso en configuración de Swagger
module.exports = swaggerDefinition;