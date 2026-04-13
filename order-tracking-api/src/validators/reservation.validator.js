// Importar funciones de validación de express-validator
const { body, param } = require('express-validator');
// Importar modelo Reservation para validación personalizada
const Reservation = require('../models/reservation.model');

// Reglas de validación para crear una reserva
exports.createReservationValidator = [
    body('tableNumber').notEmpty().withMessage('Mesa requerida'),
    body('reservedAt')
        .notEmpty().withMessage('Fecha/hora requerida')
        .isISO8601().withMessage('Fecha/hora inválida')
        .custom(value => {
            const date = new Date(value);
            if (date <= new Date()) {
                throw new Error('La fecha/hora debe ser futura');
            }
            return true;
        }),
    body('tableNumber').custom(async (value, { req }) => {
        const reservedAt = new Date(req.body.reservedAt);
        const existing = await Reservation.findOne({
            tableNumber: value,
            reservedAt,
            status: 'ACTIVA'
        });
        if (existing) {
            throw new Error('La mesa ya está reservada en ese horario');
        }
        return true;
    })
];

// Reglas de validación para cancelar una reserva
exports.cancelReservationValidator = [
    param('id').isMongoId().withMessage('ID inválido')
];

// Reglas de validación para completar una reserva
exports.completeReservationValidator = [
    param('id').isMongoId().withMessage('ID inválido')
];
