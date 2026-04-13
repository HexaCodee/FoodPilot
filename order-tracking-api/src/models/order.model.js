// Importar Mongoose para definición de esquema
const mongoose = require('mongoose');

// Definir el esquema para Order
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

// Exportar el modelo Order
module.exports = mongoose.model('Order', orderSchema);