const Reservation = require('../models/reservation.model');
const Table = require('../models/table.model');

// helper that ensures a table document exists and sets its status
async function markTable(number, status) {
    const table = await Table.findOneAndUpdate(
        { number },
        { status },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return table;
}

exports.createReservation = async (req, res, next) => {
    try {
        const reservation = new Reservation(req.body);
        await reservation.save();
        // mark table as reserved
        await markTable(reservation.tableNumber, 'RESERVADA');
        res.status(201).json(reservation);
    } catch (error) {
        // duplicate key error from unique index
        if (error.code === 11000) {
            return res.status(400).json({ message: 'La mesa ya está reservada' });
        }
        next(error);
    }
};

exports.getReservations = async (req, res, next) => {
    try {
        const reservations = await Reservation.find();
        res.json(reservations);
    } catch (error) {
        next(error);
    }
};

exports.getReservationById = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        res.json(reservation);
    } catch (error) {
        next(error);
    }
};

// finish reservation when customers have left
exports.completeReservation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findByIdAndUpdate(
            id,
            { status: 'COMPLETADA' },
            { new: true }
        );
        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        // free table
        await markTable(reservation.tableNumber, 'DISPONIBLE');
        res.json(reservation);
    } catch (error) {
        next(error);
    }
};

exports.getReservationById = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        res.json(reservation);
    } catch (error) {
        next(error);
    }
};

exports.cancelReservation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findByIdAndUpdate(
            id,
            { status: 'CANCELADA' },
            { new: true }
        );
        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        // free the table
        await markTable(reservation.tableNumber, 'DISPONIBLE');
        res.json(reservation);
    } catch (error) {
        next(error);
    }
};
