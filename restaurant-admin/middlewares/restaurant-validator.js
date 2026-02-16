import { body, param } from 'express-validator';
import { validateJWT } from './validate-JWT.js';
import { checkValidators } from './check-validators.js';

// Validaciones para crear restaurante
export const validateCreateRestaurant = [
  validateJWT,

  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del restaurante es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('La dirección es obligatoria')
    .isLength({ min: 5, max: 200 })
    .withMessage('La dirección debe tener entre 5 y 200 caracteres'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('El teléfono es obligatorio')
    .isLength({ min: 8, max: 15 })
    .withMessage('Teléfono no válido'),

  body('category')
    .notEmpty()
    .withMessage('La categoría es obligatoria')
    .isIn(['FAST_FOOD', 'FORMAL', 'CAFETERIA'])
    .withMessage('Categoría no válida'),

  checkValidators,
];
