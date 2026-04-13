// Importar express-rate-limit para limitación de tasa
const rateLimit = require('express-rate-limit');

// Configurar limitación de tasa: 100 solicitudes por 15 minutos por IP
module.exports = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Demasiadas solicitudes desde esta IP, intenta más tarde.'
});