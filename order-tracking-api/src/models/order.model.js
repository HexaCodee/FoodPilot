const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    product: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['PENDIENTE', 'ENVIADO', 'ENTREGADO'],
        default: 'PENDIENTE'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);