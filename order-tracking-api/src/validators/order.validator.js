const { body, param } = require('express-validator');

exports.createOrderValidator = [
    body('customerName').notEmpty().withMessage('Nombre requerido'),
    body('product').notEmpty().withMessage('Producto requerido'),
    body('quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0')
];

exports.updateStatusValidator = [
    param('id').isMongoId().withMessage('ID inválido'),
    body('status')
        .isIn(['PENDIENTE', 'ENVIADO', 'ENTREGADO'])
        .withMessage('Estado inválido')
];