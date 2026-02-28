const express = require('express');
const router = express.Router();

const controller = require('../controllers/reservation.controller');
const { createReservationValidator, cancelReservationValidator, completeReservationValidator } = require('../validators/reservation.validator');
const validate = require('../../middlewares/validation.middleware');

router.post('/', createReservationValidator, validate, controller.createReservation);
router.get('/', controller.getReservations);
router.get('/:id', controller.getReservationById);
router.put('/:id/cancel', cancelReservationValidator, validate, controller.cancelReservation);
router.put('/:id/complete', completeReservationValidator, validate, controller.completeReservation);

module.exports = router;
