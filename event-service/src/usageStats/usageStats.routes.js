import { Router } from 'express';
import { getAllUsageStats, getUsageStatsById, createUsageStats, updateUsageStats, deleteUsageStats } from './usageStats.controller.js';

const router = Router();

/**
 * @swagger
 * /usage-stats:
 *   post:
 *     summary: Crear nuevas estadísticas de uso
 *     tags: [Usage Stats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID del evento asociado
 *               activeUsers:
 *                 type: integer
 *                 description: Número de usuarios activos
 *               pageViews:
 *                 type: integer
 *                 description: Número total de visualizaciones de página
 *               averageSessionDuration:
 *                 type: number
 *                 description: Duración promedio de sesión en minutos
 *             required: [eventId, activeUsers]
 *     responses:
 *       201:
 *         description: Estadísticas de uso creadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID único de la estadística
 *                 eventId:
 *                   type: string
 *                   description: ID del evento asociado
 *                 activeUsers:
 *                   type: integer
 *                   description: Número de usuarios activos
 *                 pageViews:
 *                   type: integer
 *                   description: Número total de visualizaciones de página
 *                 averageSessionDuration:
 *                   type: number
 *                   description: Duración promedio de sesión en minutos
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
router.post('/', createUsageStats);

/**
 * @swagger
 * /usage-stats:
 *   get:
 *     summary: Obtener todas las estadísticas de uso
 *     tags: [Usage Stats]
 *     responses:
 *       200:
 *         description: Lista de estadísticas de uso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID único de la estadística
 *                   eventId:
 *                     type: string
 *                     description: ID del evento asociado
 *                   activeUsers:
 *                     type: integer
 *                     description: Número de usuarios activos
 *                   pageViews:
 *                     type: integer
 *                     description: Número total de visualizaciones de página
 *                   averageSessionDuration:
 *                     type: number
 *                     description: Duración promedio de sesión en minutos
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de creación
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de última actualización
 */
router.get('/', getAllUsageStats);

/**
 * @swagger
 * /usage-stats/{id}:
 *   get:
 *     summary: Obtener una estadística de uso por ID
 *     tags: [Usage Stats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la estadística de uso
 *     responses:
 *       200:
 *         description: Estadística de uso encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID único de la estadística
 *                 eventId:
 *                   type: string
 *                   description: ID del evento asociado
 *                 activeUsers:
 *                   type: integer
 *                   description: Número de usuarios activos
 *                 pageViews:
 *                   type: integer
 *                   description: Número total de visualizaciones de página
 *                 averageSessionDuration:
 *                   type: number
 *                   description: Duración promedio de sesión en minutos
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de creación
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de última actualización
 *       404:
 *         description: Estadística de uso no encontrada
 */
router.get('/:id', getUsageStatsById);

/**
 * @swagger
 * /usage-stats/{id}:
 *   patch:
 *     summary: Actualizar estadísticas de uso
 *     tags: [Usage Stats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la estadística de uso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID del evento asociado
 *               activeUsers:
 *                 type: integer
 *                 description: Número de usuarios activos
 *               pageViews:
 *                 type: integer
 *                 description: Número total de visualizaciones de página
 *               averageSessionDuration:
 *                 type: number
 *                 description: Duración promedio de sesión en minutos
 *     responses:
 *       200:
 *         description: Estadísticas de uso actualizadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID único de la estadística
 *                 eventId:
 *                   type: string
 *                   description: ID del evento asociado
 *                 activeUsers:
 *                   type: integer
 *                   description: Número de usuarios activos
 *                 pageViews:
 *                   type: integer
 *                   description: Número total de visualizaciones de página
 *                 averageSessionDuration:
 *                   type: number
 *                   description: Duración promedio de sesión en minutos
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de creación
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de última actualización
 *       404:
 *         description: Estadística de uso no encontrada
 *       400:
 *         description: Datos inválidos
 */
router.put('/:id', updateUsageStats);

/**
 * @swagger
 * /usage-stats/{id}:
 *   delete:
 *     summary: Eliminar estadísticas de uso
 *     tags: [Usage Stats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la estadística de uso
 *     responses:
 *       200:
 *         description: Estadística de uso eliminada exitosamente
 *       404:
 *         description: Estadística de uso no encontrada
 */
router.delete('/:id', deleteUsageStats);

export default router;
