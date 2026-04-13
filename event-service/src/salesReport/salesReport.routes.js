import { Router } from 'express';
import { getAllSalesReports, getSalesReportById, createSalesReport, updateSalesReport, deleteSalesReport } from './salesReport.controller.js';

const router = Router();

/**
 * @swagger
 * /sales-reports:
 *   post:
 *     summary: Crear un nuevo reporte de ventas
 *     tags: [Sales Reports]
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
 *               totalSales:
 *                 type: number
 *                 description: Total de ventas
 *               itemsSold:
 *                 type: integer
 *                 description: Cantidad de artículos vendidos
 *               revenue:
 *                 type: number
 *                 description: Ingresos totales
 *             required: [eventId, totalSales]
 *     responses:
 *       201:
 *         description: Reporte de ventas creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID único del reporte
 *                 eventId:
 *                   type: string
 *                   description: ID del evento asociado
 *                 totalSales:
 *                   type: number
 *                   description: Total de ventas
 *                 itemsSold:
 *                   type: integer
 *                   description: Cantidad de artículos vendidos
 *                 revenue:
 *                   type: number
 *                   description: Ingresos totales
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
router.post('/', createSalesReport);

/**
 * @swagger
 * /sales-reports:
 *   get:
 *     summary: Obtener todos los reportes de ventas
 *     tags: [Sales Reports]
 *     responses:
 *       200:
 *         description: Lista de reportes de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID único del reporte
 *                   eventId:
 *                     type: string
 *                     description: ID del evento asociado
 *                   totalSales:
 *                     type: number
 *                     description: Total de ventas
 *                   itemsSold:
 *                     type: integer
 *                     description: Cantidad de artículos vendidos
 *                   revenue:
 *                     type: number
 *                     description: Ingresos totales
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de creación
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de última actualización
 */
router.get('/', getAllSalesReports);

/**
 * @swagger
 * /sales-reports/{id}:
 *   get:
 *     summary: Obtener un reporte de ventas por ID
 *     tags: [Sales Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del reporte de ventas
 *     responses:
 *       200:
 *         description: Reporte de ventas encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID único del reporte
 *                 eventId:
 *                   type: string
 *                   description: ID del evento asociado
 *                 totalSales:
 *                   type: number
 *                   description: Total de ventas
 *                 itemsSold:
 *                   type: integer
 *                   description: Cantidad de artículos vendidos
 *                 revenue:
 *                   type: number
 *                   description: Ingresos totales
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de creación
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de última actualización
 *       404:
 *         description: Reporte de ventas no encontrado
 */
router.get('/:id', getSalesReportById);

/**
 * @swagger
 * /sales-reports/{id}:
 *   patch:
 *     summary: Actualizar un reporte de ventas
 *     tags: [Sales Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del reporte de ventas
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
 *               totalSales:
 *                 type: number
 *                 description: Total de ventas
 *               itemsSold:
 *                 type: integer
 *                 description: Cantidad de artículos vendidos
 *               revenue:
 *                 type: number
 *                 description: Ingresos totales
 *     responses:
 *       200:
 *         description: Reporte de ventas actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID único del reporte
 *                 eventId:
 *                   type: string
 *                   description: ID del evento asociado
 *                 totalSales:
 *                   type: number
 *                   description: Total de ventas
 *                 itemsSold:
 *                   type: integer
 *                   description: Cantidad de artículos vendidos
 *                 revenue:
 *                   type: number
 *                   description: Ingresos totales
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de creación
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de última actualización
 *       404:
 *         description: Reporte de ventas no encontrado
 *       400:
 *         description: Datos inválidos
 */
router.put('/:id', updateSalesReport);

/**
 * @swagger
 * /sales-reports/{id}:
 *   delete:
 *     summary: Eliminar un reporte de ventas
 *     tags: [Sales Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del reporte de ventas
 *     responses:
 *       200:
 *         description: Reporte de ventas eliminado exitosamente
 *       404:
 *         description: Reporte de ventas no encontrado
 */
router.delete('/:id', deleteSalesReport);

export default router;
