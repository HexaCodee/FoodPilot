// Importar modelo Order
const Order = require('../models/order.model');

// Crear un nuevo pedido
exports.createOrder = async (req, res, next) => {
    try {
        // Crear pedido desde el cuerpo de la solicitud
        const order = await Order.create(req.body);
        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

// Obtener todos los pedidos
exports.getOrders = async (req, res, next) => {
    try {
        // Obtener todos los pedidos de la base de datos
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// Obtener un pedido específico por ID
exports.getOrderById = async (req, res, next) => {
    try {
        // Encontrar pedido por ID
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });
        res.json(order);
    } catch (error) {
        next(error);
    }
};

// Actualizar estado del pedido
exports.updateStatus = async (req, res, next) => {
    try {
        // Actualizar estado y devolver pedido actualizado
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(order);
    } catch (error) {
        next(error);
    }
};