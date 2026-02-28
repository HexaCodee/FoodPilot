const express = require('express');
const router = express.Router();

const controller = require('../controllers/order.controller');
const { createOrderValidator, updateStatusValidator } = require('../validators/order.validator');
const validate = require('../../middlewares/validation.middleware');

router.post('/', createOrderValidator, validate, controller.createOrder);
router.get('/', controller.getOrders);
router.get('/:id', controller.getOrderById);
router.put('/:id/status', updateStatusValidator, validate, controller.updateStatus);

module.exports = router;