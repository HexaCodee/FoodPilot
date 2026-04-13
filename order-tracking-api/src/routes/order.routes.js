// Importar Router de Express
const express = require('express');
const router = express.Router();

// Importar controlador de pedidos
const controller = require('../controllers/order.controller');
// Importar validadores de pedidos
const { createOrderValidator, updateStatusValidator } = require('../validators/order.validator');
// Importar middleware de validación
const validate = require('../../middlewares/validation.middleware');

// Ruta para crear un nuevo pedido
router.post('/', createOrderValidator, validate, controller.createOrder);
// Ruta para obtener todos los pedidos
router.get('/', controller.getOrders);
// Ruta para obtener un pedido específico por ID
router.get('/:id', controller.getOrderById);
// Ruta para actualizar estado del pedido
router.put('/:id/status', updateStatusValidator, validate, controller.updateStatus);

// Exportar el router
module.exports = router;