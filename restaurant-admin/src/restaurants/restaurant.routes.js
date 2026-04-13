import { Router } from "express";
import {
    createRestaurantController,
    getRestaurantsController,
    getRestaurantByIdController,
    updateRestaurantController,
    changeRestaurantStatusController
} from "./restaurant.controller.js";
import { validateCreateRestaurant } from "../../middlewares/restaurant-validator.js";

const router = Router();

/**
 * @swagger
 * /restaurants:
 *   post:
 *     summary: Crear un restaurante
 *     tags: [Restaurants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del restaurante
 *               address:
 *                 type: string
 *                 description: Dirección del restaurante
 *               phone:
 *                 type: string
 *                 description: Teléfono del restaurante
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Estado del restaurante
 *             required: [name, address, phone]
 *     responses:
 *       201:
 *         description: Restaurante creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID del restaurante
 *                 name:
 *                   type: string
 *                   description: Nombre del restaurante
 *                 address:
 *                   type: string
 *                   description: Dirección del restaurante
 *                 phone:
 *                   type: string
 *                   description: Teléfono del restaurante
 *                 status:
 *                   type: string
 *                   enum: [active, inactive]
 *                   description: Estado del restaurante
 *       400:
 *         description: Datos inválidos
 */
router.post('/', validateCreateRestaurant, createRestaurantController);

/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: Listar restaurantes
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: Lista de restaurantes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID del restaurante
 *                   name:
 *                     type: string
 *                     description: Nombre del restaurante
 *                   address:
 *                     type: string
 *                     description: Dirección del restaurante
 *                   phone:
 *                     type: string
 *                     description: Teléfono del restaurante
 *                   status:
 *                     type: string
 *                     enum: [active, inactive]
 *                     description: Estado del restaurante
 */
router.get('/', getRestaurantsController);

/**
 * @swagger
 * /restaurants/{id}:
 *   get:
 *     summary: Obtener restaurante por ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *     responses:
 *       200:
 *         description: Restaurante encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID del restaurante
 *                 name:
 *                   type: string
 *                   description: Nombre del restaurante
 *                 address:
 *                   type: string
 *                   description: Dirección del restaurante
 *                 phone:
 *                   type: string
 *                   description: Teléfono del restaurante
 *                 status:
 *                   type: string
 *                   enum: [active, inactive]
 *                   description: Estado del restaurante
 *       404:
 *         description: Restaurante no encontrado
 */
router.get('/:id', getRestaurantByIdController);

/**
 * @swagger
 * /restaurants/{id}:
 *   put:
 *     summary: Actualizar restaurante
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del restaurante
 *               address:
 *                 type: string
 *                 description: Dirección del restaurante
 *               phone:
 *                 type: string
 *                 description: Teléfono del restaurante
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Estado del restaurante
 *             required: [name, address, phone]
 *     responses:
 *       200:
 *         description: Restaurante actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID del restaurante
 *                 name:
 *                   type: string
 *                   description: Nombre del restaurante
 *                 address:
 *                   type: string
 *                   description: Dirección del restaurante
 *                 phone:
 *                   type: string
 *                   description: Teléfono del restaurante
 *                 status:
 *                   type: string
 *                   enum: [active, inactive]
 *                   description: Estado del restaurante
 *       404:
 *         description: Restaurante no encontrado
 */
router.put('/:id', updateRestaurantController);

/**
 * @swagger
 * /restaurants/{id}/activate:
 *   patch:
 *     summary: Activar restaurante
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *     responses:
 *       200:
 *         description: Restaurante activado
 *       404:
 *         description: Restaurante no encontrado
 */
router.patch('/:id/activate', changeRestaurantStatusController);

/**
 * @swagger
 * /restaurants/{id}/deactivate:
 *   patch:
 *     summary: Desactivar restaurante
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *     responses:
 *       200:
 *         description: Restaurante desactivado
 *       404:
 *         description: Restaurante no encontrado
 */
router.patch('/:id/deactivate', changeRestaurantStatusController);

export default router;
