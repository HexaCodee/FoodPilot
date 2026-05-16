import { body } from 'express-validator';
import { validateJWT } from './validate-JWT.js';
import { checkValidators } from './check-validators.js';

const CATEGORIES = ['FAST_FOOD', 'FORMAL', 'CAFETERIA', 'ITALIANA', 'MEXICANA', 'MARISCOS', 'PARRILLA', 'VEGANA', 'FUSION', 'DESAYUNOS', 'SUSHI'];
const DAYS       = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const validateCreateRestaurant = [
    validateJWT,

    body('name')
        .trim().notEmpty().withMessage('El nombre del restaurante es obligatorio')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('address')
        .trim().notEmpty().withMessage('La dirección es obligatoria')
        .isLength({ min: 5, max: 200 }).withMessage('La dirección debe tener entre 5 y 200 caracteres'),

    body('phone')
        .trim().notEmpty().withMessage('El teléfono es obligatorio')
        .isLength({ min: 8, max: 15 }).withMessage('Teléfono no válido'),

    body('category')
        .notEmpty().withMessage('La categoría es obligatoria')
        .isIn(CATEGORIES).withMessage('Categoría no válida'),

    // Opcionales
    body('description')
        .optional().trim()
        .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),

    body('email')
        .optional().trim()
        .isEmail().withMessage('Email no válido'),

    body('website')
        .optional().trim()
        .isURL().withMessage('URL del sitio web no válida'),

    body('averagePrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('El precio promedio debe ser mayor o igual a 0'),

    body('photos')
        .optional()
        .isArray().withMessage('Las fotos deben ser un arreglo'),

    body('photos.*')
        .optional().trim()
        .isString().withMessage('Cada foto debe ser una cadena de texto'),

    body('openingHours')
        .optional()
        .isArray().withMessage('Los horarios deben ser un arreglo'),

    body('openingHours.*.day')
        .optional()
        .isIn(DAYS).withMessage('Día no válido'),

    body('openingHours.*.open')
        .optional()
        .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Hora de apertura no válida (formato HH:MM)'),

    body('openingHours.*.close')
        .optional()
        .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Hora de cierre no válida (formato HH:MM)'),

    body('coordinates.lat')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('Latitud no válida'),

    body('coordinates.lng')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('Longitud no válida'),

    checkValidators,
];
