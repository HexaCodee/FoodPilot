import { body, param } from 'express-validator';
import { validateJWT } from './validate-JWT.js';
import { checkValidators } from './check-validators.js';

export const validateCreateTable = [
  validateJWT,

  body('tableNumber')
    .notEmpty()
    .withMessage('El número de mesa es obligatorio')
    .isInt({ min: 1 })
    .withMessage('Debe ser un número válido'),

  body('capacity')
    .notEmpty()
    .withMessage('La capacidad es obligatoria')
    .isInt({ min: 1 })
    .withMessage('Debe ser mayor a 0'),

  body('restaurant')
    .notEmpty()
    .withMessage('El restaurante es obligatorio')
    .isMongoId()
    .withMessage('ID de restaurante no válido'),

  checkValidators,
];
