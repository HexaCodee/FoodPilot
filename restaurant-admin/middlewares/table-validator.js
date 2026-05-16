import { body } from 'express-validator';
import { validateJWT } from './validate-JWT.js';
import { checkValidators } from './check-validators.js';

const LOCATIONS = ['Interior', 'Terraza', 'Barra', 'Jardín', 'VIP', 'Salón privado'];
const STATUSES  = ['DISPONIBLE', 'OCUPADA', 'RESERVADA', 'FUERA_DE_SERVICIO'];

export const validateCreateTable = [
    validateJWT,

    body('tableNumber')
        .notEmpty().withMessage('El número de mesa es obligatorio')
        .isInt({ min: 1 }).withMessage('Debe ser un número entero mayor a 0'),

    body('capacity')
        .notEmpty().withMessage('La capacidad es obligatoria')
        .isInt({ min: 1 }).withMessage('Debe ser mayor a 0'),

    body('restaurant')
        .notEmpty().withMessage('El restaurante es obligatorio')
        .isMongoId().withMessage('ID de restaurante no válido'),

    // Opcionales
    body('location')
        .optional()
        .isIn(LOCATIONS).withMessage(`Ubicación no válida. Opciones: ${LOCATIONS.join(', ')}`),

    body('status')
        .optional()
        .isIn(STATUSES).withMessage(`Estado no válido. Opciones: ${STATUSES.join(', ')}`),

    checkValidators,
];
