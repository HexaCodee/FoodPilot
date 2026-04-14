// Importar Router de Express
const express = require('express');
const router = express.Router();

// Importar controlador de reservas
const controller = require('../controllers/reservation.controller');
// Importar validadores de reservas
const { createReservationValidator, cancelReservationValidator, completeReservationValidator } = require('../validators/reservation.validator');
// Importar middleware de validación
const validate = require('../../middlewares/validation.middleware');

/**
 * @swagger
 * tags:
 *   - name: Reservations
 *     description: Operaciones relacionadas con reservas
 */

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Crear una nueva reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableNumber:
 *                 type: string
 *                 description: Número de mesa reservada
 *               reservedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de la reserva
 *             required: [tableNumber, reservedAt]
 *     responses:
 *       201:
 *         description: Reserva creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tableNumber:
 *                   type: string
 *                   description: Número de mesa reservada
 *                 reservedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha y hora de la reserva
 *                 status:
 *                   type: string
 *                   enum: [PENDIENTE, CONFIRMADA, CANCELADA, COMPLETADA]
 *                   description: Estado de la reserva
 *       400:
 *         description: Error de validación o mesa ya reservada
 */
router.post('/', createReservationValidator, validate, controller.createReservation);

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Obtener todas las reservas
 *     responses:
 *       200:
 *         description: Lista de reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tableNumber:
 *                     type: string
 *                     description: Número de mesa reservada
 *                   reservedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha y hora de la reserva
 *                   status:
 *                     type: string
 *                     enum: [PENDIENTE, CONFIRMADA, CANCELADA, COMPLETADA]
 *                     description: Estado de la reserva
 */
router.get('/', controller.getReservations);

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     tags: [Reservations]
 *     summary: Obtener reserva por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Detalles de la reserva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tableNumber:
 *                   type: string
 *                   description: Número de mesa reservada
 *                 reservedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha y hora de la reserva
 *                 status:
 *                   type: string
 *                   enum: [PENDIENTE, CONFIRMADA, CANCELADA, COMPLETADA]
 *                   description: Estado de la reserva
 *       404:
 *         description: Reserva no encontrada
 */
router.get('/:id', controller.getReservationById);

/**
 * @swagger
 * /api/reservations/{id}/cancel:
 *   put:
 *     tags: [Reservations]
 *     summary: Cancelar una reserva
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva cancelada
 *       404:
 *         description: Reserva no encontrada
 */
router.put('/:id/cancel', cancelReservationValidator, validate, controller.cancelReservation);

/**
 * @swagger
 * /api/reservations/{id}/complete:
 *   put:
 *     tags: [Reservations]
 *     summary: Completar una reserva
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva completada
 *       404:
 *         description: Reserva no encontrada
 */
router.put('/:id/complete', completeReservationValidator, validate, controller.completeReservation);

// Exportar el router
module.exports = router;
