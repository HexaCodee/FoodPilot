import { Router } from "express";
import { validateCreateTable } from "../../middlewares/table-validator.js";

const router = Router();

import {
    createTableController,
    getTablesController,
    getTableByIdController,
    updateTableController,
    changeTableStatusController
} from "./table.controller.js";

/**
 * @swagger
 * /tables:
 *   post:
 *     summary: Crear una mesa
 *     tags: [Tables]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               number:
 *                 type: number
 *                 description: Número de la mesa
 *               capacity:
 *                 type: number
 *                 description: Capacidad de la mesa
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Estado de la mesa
 *             required: [number, capacity]
 *     responses:
 *       201:
 *         description: Mesa creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID de la mesa
 *                 number:
 *                   type: number
 *                   description: Número de la mesa
 *                 capacity:
 *                   type: number
 *                   description: Capacidad de la mesa
 *                 status:
 *                   type: string
 *                   enum: [active, inactive]
 *                   description: Estado de la mesa
 *       400:
 *         description: Datos inválidos
 */
router.post('/', validateCreateTable, createTableController);

/**
 * @swagger
 * /tables:
 *   get:
 *     summary: Listar mesas
 *     tags: [Tables]
 *     responses:
 *       200:
 *         description: Lista de mesas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID de la mesa
 *                   number:
 *                     type: number
 *                     description: Número de la mesa
 *                   capacity:
 *                     type: number
 *                     description: Capacidad de la mesa
 *                   status:
 *                     type: string
 *                     enum: [active, inactive]
 *                     description: Estado de la mesa
 */
router.get('/', getTablesController);

/**
 * @swagger
 * /tables/{id}:
 *   get:
 *     summary: Obtener mesa por ID
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mesa
 *     responses:
 *       200:
 *         description: Mesa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID de la mesa
 *                 number:
 *                   type: number
 *                   description: Número de la mesa
 *                 capacity:
 *                   type: number
 *                   description: Capacidad de la mesa
 *                 status:
 *                   type: string
 *                   enum: [active, inactive]
 *                   description: Estado de la mesa
 *       404:
 *         description: Mesa no encontrada
 */
router.get('/:id', getTableByIdController);

/**
 * @swagger
 * /tables/{id}:
 *   put:
 *     summary: Actualizar mesa
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mesa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               number:
 *                 type: number
 *                 description: Número de la mesa
 *               capacity:
 *                 type: number
 *                 description: Capacidad de la mesa
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Estado de la mesa
 *             required: [number, capacity]
 *     responses:
 *       200:
 *         description: Mesa actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID de la mesa
 *                 number:
 *                   type: number
 *                   description: Número de la mesa
 *                 capacity:
 *                   type: number
 *                   description: Capacidad de la mesa
 *                 status:
 *                   type: string
 *                   enum: [active, inactive]
 *                   description: Estado de la mesa
 *       404:
 *         description: Mesa no encontrada
 */
router.put('/:id', updateTableController);

/**
 * @swagger
 * /tables/{id}/activate:
 *   patch:
 *     summary: Activar mesa
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mesa
 *     responses:
 *       200:
 *         description: Mesa activada
 *       404:
 *         description: Mesa no encontrada
 */
router.patch('/:id/activate', changeTableStatusController);

/**
 * @swagger
 * /tables/{id}/deactivate:
 *   patch:
 *     summary: Desactivar mesa
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mesa
 *     responses:
 *       200:
 *         description: Mesa desactivada
 *       404:
 *         description: Mesa no encontrada
 */
router.patch('/:id/deactivate', changeTableStatusController);

export default router;
