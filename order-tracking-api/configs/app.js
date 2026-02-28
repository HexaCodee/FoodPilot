const express = require('express');
const morgan = require('morgan');

const corsConfig = require('./cors.configuration');
const helmetConfig = require('./helmet.configuration');
const rateLimitConfig = require('./ratelimit.configuration');

const orderRoutes = require('../src/routes/order.routes');
const errorMiddleware = require('../middlewares/error.middleware');
const notFoundMiddleware = require('../middlewares/notfound.middleware');

const app = express();

// Seguridad
app.use(helmetConfig);
app.use(corsConfig);
app.use(rateLimitConfig);

// Logs
app.use(morgan('dev'));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/orders', orderRoutes);

// Not Found
app.use(notFoundMiddleware);

// Error Handler
app.use(errorMiddleware);

module.exports = app;