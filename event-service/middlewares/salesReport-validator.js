import { body } from 'express-validator';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { checkValidators } from '../../middlewares/check-validators.js';

export const validateCreateSalesReport = [
  validateJWT,

  body('restaurantId')
    .notEmpty()
    .withMessage('El restaurante es obligatorio')
    .isMongoId()
    .withMessage('ID de restaurante no válido'),

  body('period.type')
    .notEmpty()
    .withMessage('El tipo de periodo es obligatorio')
    .isIn(['DÍA', 'SEMANA', 'MES', 'AÑO'])
    .withMessage('Tipo de periodo no válido'),

  body('totalSales')
    .notEmpty()
    .withMessage('Las ventas totales son obligatorias')
    .isFloat({ min: 0 })
    .withMessage('Las ventas totales no pueden ser negativas'),

  body('totalOrders')
    .notEmpty()
    .withMessage('El total de órdenes es obligatorio')
    .isInt({ min: 0 })
    .withMessage('El total de órdenes no puede ser negativo'),

  checkValidators,
];
