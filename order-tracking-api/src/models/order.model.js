// Importar Mongoose para definición de esquema
const mongoose = require('mongoose');

// Definir el esquema para Order
const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    product: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['PENDIENTE', 'ENVIADO', 'ENTREGADO', 'CANCELADO'],
      default: 'PENDIENTE',
    },
    userId: {
      type: String,
      trim: true,
    },
    price: { type: Number, min: 0 },
    restaurantId: { type: String, trim: true },
  },
  { timestamps: true }
);

// Exportar el modelo Order
module.exports = mongoose.model('Order', orderSchema);
