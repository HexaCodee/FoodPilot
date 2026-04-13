// Importar modelos Reservation y Table
const Reservation = require('../models/reservation.model');
const Table = require('../models/table.model');

// Función auxiliar para asegurar que existe un documento de mesa y establecer su estado
async function markTable(number, status) {
    const table = await Table.findOneAndUpdate(
        { number },
        { status },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return table;
}

// Crear una nueva reserva
exports.createReservation = async (req, res, next) => {
    try {
        const reservation = new Reservation(req.body);
        await reservation.save();
        // Marcar mesa como reservada
        await markTable(reservation.tableNumber, 'RESERVADA');
        res.status(201).json(reservation);
    } catch (error) {
        // Manejar error de clave duplicada para índice único
        if (error.code === 11000) {
            return res.status(400).json({ message: 'La mesa ya está reservada' });
        }
        next(error);
    }
};

// Obtener todas las reservas
exports.getReservations = async (req, res, next) => {
    try {
        const reservations = await Reservation.find();
        res.json(reservations);
    } catch (error) {
        next(error);
    }
};

// Obtener una reserva específica por ID
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

// Completar una reserva cuando los clientes se han ido
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
        // Liberar la mesa
        await markTable(reservation.tableNumber, 'DISPONIBLE');
        res.json(reservation);
    } catch (error) {
        next(error);
    }
};

// Función duplicada - Obtener una reserva específica por ID
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

// Cancelar una reserva
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
        // Liberar la mesa
        await markTable(reservation.tableNumber, 'DISPONIBLE');
        res.json(reservation);
    } catch (error) {
        next(error);
    }
};
