// Importar Router de Express
const express = require('express');
const router = express.Router();

// Importar controlador de reservas
const controller = require('../controllers/reservation.controller');
// Importar validadores de reservas
const { createReservationValidator, cancelReservationValidator, completeReservationValidator } = require('../validators/reservation.validator');
// Importar middleware de validación
const validate = require('../../middlewares/validation.middleware');

// Ruta para crear una nueva reserva
router.post('/', createReservationValidator, validate, controller.createReservation);
// Ruta para obtener todas las reservas
router.get('/', controller.getReservations);
// Ruta para obtener una reserva específica por ID
router.get('/:id', controller.getReservationById);
// Ruta para cancelar una reserva
router.put('/:id/cancel', cancelReservationValidator, validate, controller.cancelReservation);
// Ruta para completar una reserva
router.put('/:id/complete', completeReservationValidator, validate, controller.completeReservation);

// Exportar el router
module.exports = router;
