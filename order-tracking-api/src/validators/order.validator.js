// Importar funciones de validación de express-validator
const { body, param } = require('express-validator');

// Reglas de validación para crear un pedido
exports.createOrderValidator = [
    body('customerName').notEmpty().withMessage('Nombre requerido'),
    body('product').notEmpty().withMessage('Producto requerido'),
    body('quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0')
];

// Reglas de validación para actualizar estado del pedido
exports.updateStatusValidator = [
    param('id').isMongoId().withMessage('ID inválido'),
    body('status')
        .isIn(['PENDIENTE', 'ENVIADO', 'ENTREGADO'])
        .withMessage('Estado inválido')
];