// Importar resultado de validación de express-validator
const { validationResult } = require('express-validator');

// Middleware para manejar errores de validación
module.exports = (req, res, next) => {
    // Obtener errores de validación de la solicitud
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Devolver 400 con detalles de error si falla la validación
        return res.status(400).json({ errors: errors.array() });
    }
    // Proceder al siguiente middleware si no hay errores
    next();
};