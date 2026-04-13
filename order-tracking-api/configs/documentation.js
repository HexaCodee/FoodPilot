// Especificación OpenAPI 3.0 para API de Seguimiento de Pedidos
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Seguimiento de Pedidos',
    version: '1.0.0',
    description: 'API para gestionar pedidos y reservas en un sistema de seguimiento de alimentos'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desarrollo'
    }
  ],
  paths: {
    '/api/orders': {
      post: {
        summary: 'Crear un nuevo pedido',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  customerName: { type: 'string' },
                  product: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 }
                },
                required: ['customerName', 'product', 'quantity']
              }
            }
          }
        },
        responses: {
          201: { description: 'Pedido creado exitosamente' },
          400: { description: 'Error de validación' }
        }
      },
      get: {
        summary: 'Obtener todos los pedidos',
        responses: {
          200: { description: 'Lista de pedidos' }
        }
      }
    },
    '/api/orders/{id}': {
      get: {
        summary: 'Obtener pedido por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: { description: 'Detalles del pedido' },
          404: { description: 'Pedido no encontrado' }
        }
      }
    },
    '/api/orders/{id}/status': {
      put: {
        summary: 'Actualizar estado del pedido',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['PENDIENTE', 'ENVIADO', 'ENTREGADO'] }
                },
                required: ['status']
              }
            }
          }
        },
        responses: {
          200: { description: 'Estado actualizado' },
          400: { description: 'Estado inválido' }
        }
      }
    },
    '/api/reservations': {
      post: {
        summary: 'Crear una nueva reserva',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tableNumber: { type: 'string' },
                  reservedAt: { type: 'string', format: 'date-time' }
                },
                required: ['tableNumber', 'reservedAt']
              }
            }
          }
        },
        responses: {
          201: { description: 'Reserva creada' },
          400: { description: 'Error de validación o mesa ya reservada' }
        }
      },
      get: {
        summary: 'Obtener todas las reservas',
        responses: {
          200: { description: 'Lista de reservas' }
        }
      }
    },
    '/api/reservations/{id}': {
      get: {
        summary: 'Obtener reserva por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: { description: 'Detalles de la reserva' },
          404: { description: 'Reserva no encontrada' }
        }
      }
    },
    '/api/reservations/{id}/cancel': {
      put: {
        summary: 'Cancelar una reserva',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: { description: 'Reserva cancelada' },
          404: { description: 'Reserva no encontrada' }
        }
      }
    },
    '/api/reservations/{id}/complete': {
      put: {
        summary: 'Completar una reserva',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: { description: 'Reserva completada' },
          404: { description: 'Reserva no encontrada' }
        }
      }
    }
  }
};

module.exports = swaggerDefinition;