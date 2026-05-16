import { body } from 'express-validator';
import { validateJWT } from './validate-JWT.js';
import { checkValidators } from './check-validators.js';

const CATEGORIES = ['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA', 'DESAYUNO', 'COMBO'];

export const validateCreateMenu = [
    validateJWT,

    body('name')
        .trim().notEmpty().withMessage('El nombre del platillo es obligatorio')
        .isLength({ min: 2, max: 100 }).withMessage('Debe tener entre 2 y 100 caracteres'),

    body('price')
        .notEmpty().withMessage('El precio es obligatorio')
        .isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0'),

    body('category')
        .notEmpty().withMessage('La categoría es obligatoria')
        .isIn(CATEGORIES).withMessage('Categoría no válida'),

    body('restaurant')
        .notEmpty().withMessage('El restaurante es obligatorio')
        .isMongoId().withMessage('ID de restaurante no válido'),

    // Opcionales
    body('description')
        .optional().trim()
        .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),

    body('ingredients')
        .optional()
        .isArray().withMessage('Los ingredientes deben ser un arreglo'),

    body('ingredients.*')
        .optional().trim()
        .isString().withMessage('Cada ingrediente debe ser texto'),

    body('image')
        .optional().trim()
        .isString().withMessage('La imagen debe ser una URL o cadena'),

    body('preparationTime')
        .optional()
        .isInt({ min: 1 }).withMessage('El tiempo de preparación debe ser al menos 1 minuto'),

    body('isVegetarian')
        .optional()
        .isBoolean().withMessage('isVegetarian debe ser true o false'),

    body('isVegan')
        .optional()
        .isBoolean().withMessage('isVegan debe ser true o false'),

    body('isGlutenFree')
        .optional()
        .isBoolean().withMessage('isGlutenFree debe ser true o false'),

    checkValidators,
];
