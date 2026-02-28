import { body } from 'express-validator';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { checkValidators } from '../../middlewares/check-validators.js';

export const validateCreateUsageStats = [
  validateJWT,

  body('restaurantId')
    .notEmpty()
    .withMessage('El restaurante es obligatorio')
    .isMongoId()
    .withMessage('ID de restaurante no válido'),

  body('period.type')
    .notEmpty()
    .withMessage('El tipo de periodo es obligatorio')
    .isIn(['DÍA', 'SEMANA', 'MES'])
    .withMessage('Tipo de periodo no válido'),

  body('reservationsCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Las reservas no pueden ser negativas'),

  body('eventReservations')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Las reservas de eventos no pueden ser negativas'),

  checkValidators,
];
