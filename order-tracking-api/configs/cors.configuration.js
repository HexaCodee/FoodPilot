// Importar middleware CORS
const cors = require('cors');

// Configurar opciones de CORS
// Permitir todos los orígenes, métodos específicos y encabezados
module.exports = cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
});