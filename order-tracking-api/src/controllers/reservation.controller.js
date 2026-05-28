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

// Obtener todas las reservas (filtrar por userId, tableId o restaurantId si se proporcionan)
exports.getReservations = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.tableId) filter.tableId = req.query.tableId;
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    const reservations = await Reservation.find(filter).sort({ createdAt: -1 });
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

// Cancelar todas las reservas ACTIVAS de una mesa (llamado internamente al desactivar mesa)
exports.cancelReservationsByTable = async (req, res, next) => {
  try {
    const { tableId, tableNumber, restaurantId } = req.body;

    if (!tableId && !tableNumber) {
      return res.status(400).json({ message: 'tableId o tableNumber son requeridos' });
    }

    // Build an $or filter so we catch both new reservations (have tableId)
    // and legacy ones (only have tableNumber + restaurantId)
    const orClauses = [];
    if (tableId) orClauses.push({ tableId });
    if (tableNumber && restaurantId) orClauses.push({ tableNumber: String(tableNumber), restaurantId });
    else if (tableNumber) orClauses.push({ tableNumber: String(tableNumber) });

    const filter = { status: 'ACTIVA', $or: orClauses };

    const result = await Reservation.updateMany(filter, {
      status: 'CANCELADA',
      cancelledByAdmin: true,
    });

    res.json({ message: 'Reservas canceladas', count: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

// Actualizar datos de una reserva activa
exports.updateReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(404).json({ message: 'Reserva no encontrada' });
    if (reservation.status !== 'ACTIVA') {
      return res.status(400).json({ message: 'Solo se pueden modificar reservas activas' });
    }
    const { tableNumber, reservedAt } = req.body;
    if (tableNumber) reservation.tableNumber = tableNumber;
    if (reservedAt) reservation.reservedAt = new Date(reservedAt);
    await reservation.save();
    res.json(reservation);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'La mesa ya está reservada en ese horario' });
    }
    next(error);
  }
};
