import { body, param } from 'express-validator';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { checkValidators } from '../../middlewares/check-validators.js';

export const validateCreateEvent = [
  validateJWT,

  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del evento es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('Debe tener entre 2 y 100 caracteres'),

  body('date')
    .notEmpty()
    .withMessage('La fecha es obligatoria')
    .isISO8601()
    .withMessage('La fecha debe ser válida'),

  body('maxCapacity')
    .notEmpty()
    .withMessage('La capacidad máxima es obligatoria')
    .isInt({ min: 1 })
    .withMessage('La capacidad debe ser al menos 1'),

  body('price')
    .notEmpty()
    .withMessage('El precio es obligatorio')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser mayor o igual a 0'),

  body('restaurant.id')
    .notEmpty()
    .withMessage('El restaurante es obligatorio')
    .isMongoId()
    .withMessage('ID de restaurante no válido'),

  checkValidators,
];
