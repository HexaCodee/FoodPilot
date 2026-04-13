import { Router } from 'express';
import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } from './event.controller.js';

const router = Router();

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Crear un nuevo evento
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del evento
 *               description:
 *                 type: string
 *                 description: Descripción del evento
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora del evento
 *               location:
 *                 type: string
 *                 description: Ubicación del evento
 *             required: [name, date, location]
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID único del evento
 *                 name:
 *                   type: string
 *                   description: Nombre del evento
 *                 description:
 *                   type: string
 *                   description: Descripción del evento
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha y hora del evento
 *                 location:
 *                   type: string
 *                   description: Ubicación del evento
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de creación
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de última actualización
 *       400:
 *         description: Datos inválidos
 */
router.post('/', createEvent);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Obtener todos los eventos
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID único del evento
 *                   name:
 *                     type: string
 *                     description: Nombre del evento
 *                   description:
 *                     type: string
 *                     description: Descripción del evento
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha y hora del evento
 *                   location:
 *                     type: string
 *                     description: Ubicación del evento
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de creación
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de última actualización
 */
router.get('/', getAllEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Obtener un evento por ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID único del evento
 *                 name:
 *                   type: string
 *                   description: Nombre del evento
 *                 description:
 *                   type: string
 *                   description: Descripción del evento
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha y hora del evento
 *                 location:
 *                   type: string
 *                   description: Ubicación del evento
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de creación
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de última actualización
 *       404:
 *         description: Evento no encontrado
 */
router.get('/:id', getEventById);

/**
 * @swagger
 * /events/{id}:
 *   patch:
 *     summary: Actualizar un evento
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del evento
 *               description:
 *                 type: string
 *                 description: Descripción del evento
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora del evento
 *               location:
 *                 type: string
 *                 description: Ubicación del evento
 *     responses:
 *       200:
 *         description: Evento actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID único del evento
 *                 name:
 *                   type: string
 *                   description: Nombre del evento
 *                 description:
 *                   type: string
 *                   description: Descripción del evento
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha y hora del evento
 *                 location:
 *                   type: string
 *                   description: Ubicación del evento
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de creación
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de última actualización
 *       404:
 *         description: Evento no encontrado
 *       400:
 *         description: Datos inválidos
 */
router.put('/:id', updateEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Eliminar un evento
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento eliminado exitosamente
 *       404:
 *         description: Evento no encontrado
 */
router.delete('/:id', deleteEvent);

export default router;
