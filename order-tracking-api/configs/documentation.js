const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FoodPilot Order Tracking API',
      version: '1.0.0',
      description: 'API para gestionar pedidos y reservas en el sistema de seguimiento de pedidos',
      contact: {
        name: 'FoodPilot',
        email: 'support@foodpilot.local'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    tags: [
      {
        name: 'Orders',
        description: 'Operaciones relacionadas con pedidos'
      },
      {
        name: 'Reservations',
        description: 'Operaciones relacionadas con reservas'
      }
    ]
  },
  apis: [path.join(__dirname, '../src/routes/*.js')]
};

const specs = swaggerJSDoc(options);

module.exports = {
  specs,
  swaggerUI
};