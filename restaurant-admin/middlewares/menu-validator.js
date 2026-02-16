import { body, param } from 'express-validator';
import { validateJWT } from './validate-JWT.js';
import { checkValidators } from './check-validators.js';

export const validateCreateMenu = [
  validateJWT,

  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del platillo es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('Debe tener entre 2 y 100 caracteres'),

  body('price')
    .notEmpty()
    .withMessage('El precio es obligatorio')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser mayor o igual a 0'),

  body('category')
    .notEmpty()
    .withMessage('La categoría es obligatoria')
    .isIn(['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA'])
    .withMessage('Categoría no válida'),

  body('restaurant')
    .notEmpty()
    .withMessage('El restaurante es obligatorio')
    .isMongoId()
    .withMessage('ID no válido'),

  checkValidators,
];
