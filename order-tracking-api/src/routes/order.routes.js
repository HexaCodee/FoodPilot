// Importar Router de Express
const express = require('express');
const router = express.Router();

// Importar controlador de pedidos
const controller = require('../controllers/order.controller');
// Importar validadores de pedidos
const { createOrderValidator, updateStatusValidator } = require('../validators/order.validator');
// Importar middleware de validación
const validate = require('../../middlewares/validation.middleware');

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Operaciones relacionadas con pedidos
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Crear un nuevo pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *                 description: Nombre del cliente
 *               product:
 *                 type: string
 *                 description: Producto del pedido
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Cantidad del producto
 *             required: [customerName, product, quantity]
 *     responses:
 *       201:
 *         description: Pedido creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/', createOrderValidator, validate, controller.createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener todos los pedidos
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   customerName:
 *                     type: string
 *                     description: Nombre del cliente
 *                   product:
 *                     type: string
 *                     description: Producto del pedido
 *                   quantity:
 *                     type: integer
 *                     minimum: 1
 *                     description: Cantidad del producto
 *                   status:
 *                     type: string
 *                     enum: [PENDIENTE, ENVIADO, ENTREGADO]
 *                     description: Estado del pedido
 */
router.get('/', controller.getOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener pedido por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles del pedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customerName:
 *                   type: string
 *                   description: Nombre del cliente
 *                 product:
 *                   type: string
 *                   description: Producto del pedido
 *                 quantity:
 *                   type: integer
 *                   minimum: 1
 *                   description: Cantidad del producto
 *                 status:
 *                   type: string
 *                   enum: [PENDIENTE, ENVIADO, ENTREGADO]
 *                   description: Estado del pedido
 *       404:
 *         description: Pedido no encontrado
 */
router.get('/:id', controller.getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Actualizar estado del pedido
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDIENTE, ENVIADO, ENTREGADO]
 *             required: [status]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Estado inválido
 */
router.put('/:id/status', updateStatusValidator, validate, controller.updateStatus);

// Exportar el router
module.exports = router;