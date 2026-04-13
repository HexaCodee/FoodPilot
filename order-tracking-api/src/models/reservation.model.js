// Importar Mongoose para definición de esquema
const mongoose = require('mongoose');

// Definir el esquema para Reservation
const reservationSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
        required: true,
        trim: true
    },
    reservedAt: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVA', 'CANCELADA', 'COMPLETADA'],
        default: 'ACTIVA'
    }
}, { timestamps: true });

// Asegurar que solo haya una reserva activa por mesa y horario
reservationSchema.index(
    { tableNumber: 1, reservedAt: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'ACTIVA' } }
);

// Exportar el modelo Reservation
module.exports = mongoose.model('Reservation', reservationSchema);
