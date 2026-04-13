import { Router } from "express";
// ...existing code...
import { validateCreateMenu } from "../../middlewares/menu-validator.js";

const router = Router();

import {
    createMenuController,
    getMenusController,
    getMenuByIdController,
    updateMenuController,
    changeMenuStatusController
} from "./menu.controller.js";

/**
 * @swagger
 * /menus:
 *   post:
 *     summary: Crear un menú
 *     tags: [Menus]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del menú
 *               description:
 *                 type: string
 *                 description: Descripción del menú
 *               price:
 *                 type: number
 *                 description: Precio del menú
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Estado del menú
 *             required: [name, description, price]
 *     responses:
 *       201:
 *         description: Menú creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID del menú
 *                 name:
 *                   type: string
 *                   description: Nombre del menú
 *                 description:
 *                   type: string
 *                   description: Descripción del menú
 *                 price:
 *                   type: number
 *                   description: Precio del menú
 *                 status:
 *                   type: string
 *                   enum: [active, inactive]
 *                   description: Estado del menú
 *       400:
 *         description: Datos inválidos
 */
router.post('/', validateCreateMenu, createMenuController);

/**
 * @swagger
 * /menus:
 *   get:
 *     summary: Listar menús
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: Lista de menús
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID del menú
 *                   name:
 *                     type: string
 *                     description: Nombre del menú
 *                   description:
 *                     type: string
 *                     description: Descripción del menú
 *                   price:
 *                     type: number
 *                     description: Precio del menú
 *                   status:
 *                     type: string
 *                     enum: [active, inactive]
 *                     description: Estado del menú
 */
router.get('/', getMenusController);

/**
 * @swagger
 * /menus/{id}:
 *   get:
 *     summary: Obtener menú por ID
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del menú
 *     responses:
 *       200:
 *         description: Menú encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID del menú
 *                 name:
 *                   type: string
 *                   description: Nombre del menú
 *                 description:
 *                   type: string
 *                   description: Descripción del menú
 *                 price:
 *                   type: number
 *                   description: Precio del menú
 *                 status:
 *                   type: string
 *                   enum: [active, inactive]
 *                   description: Estado del menú
 *       404:
 *         description: Menú no encontrado
 */
router.get('/:id', getMenuByIdController);

/**
 * @swagger
 * /menus/{id}:
 *   put:
 *     summary: Actualizar menú
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del menú
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del menú
 *               description:
 *                 type: string
 *                 description: Descripción del menú
 *               price:
 *                 type: number
 *                 description: Precio del menú
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Estado del menú
 *             required: [name, description, price]
 *     responses:
 *       200:
 *         description: Menú actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID del menú
 *                 name:
 *                   type: string
 *                   description: Nombre del menú
 *                 description:
 *                   type: string
 *                   description: Descripción del menú
 *                 price:
 *                   type: number
 *                   description: Precio del menú
 *                 status:
 *                   type: string
 *                   enum: [active, inactive]
 *                   description: Estado del menú
 *       404:
 *         description: Menú no encontrado
 */
router.put('/:id', updateMenuController);

/**
 * @swagger
 * /menus/{id}/activate:
 *   patch:
 *     summary: Activar menú
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del menú
 *     responses:
 *       200:
 *         description: Menú activado
 *       404:
 *         description: Menú no encontrado
 */
router.patch('/:id/activate', changeMenuStatusController);

/**
 * @swagger
 * /menus/{id}/deactivate:
 *   patch:
 *     summary: Desactivar menú
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del menú
 *     responses:
 *       200:
 *         description: Menú desactivado
 *       404:
 *         description: Menú no encontrado
 */
router.patch('/:id/deactivate', changeMenuStatusController);

export default router;
