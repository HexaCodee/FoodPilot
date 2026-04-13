// Importar módulos requeridos
const express = require('express');
const morgan = require('morgan');

// Importar módulos de configuración
const corsConfig = require('./cors.configuration');
const helmetConfig = require('./helmet.configuration');
const rateLimitConfig = require('./ratelimit.configuration');

// Importar módulos de rutas
const orderRoutes = require('../src/routes/order.routes');
const reservationRoutes = require('../src/routes/reservation.routes');

// Importar módulos de middleware
const errorMiddleware = require('../middlewares/error.middleware');
const notFoundMiddleware = require('../middlewares/notfound.middleware');

// Crear instancia de aplicación Express
const app = express();

// Aplicar middlewares de seguridad
app.use(helmetConfig);
app.use(corsConfig);
app.use(rateLimitConfig);

// Aplicar middleware de logging
app.use(morgan('dev'));

// Parsear cuerpos JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Montar rutas de la API
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);

// Manejar 404 no encontrado
app.use(notFoundMiddleware);

// Manejar errores
app.use(errorMiddleware);

// Exportar la aplicación para usarla en index.js
module.exports = app;