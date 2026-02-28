const mongoose = require('mongoose');

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

// ensure only one active reservation per table and timeslot
reservationSchema.index(
    { tableNumber: 1, reservedAt: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'ACTIVA' } }
);

module.exports = mongoose.model('Reservation', reservationSchema);
