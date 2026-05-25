import Table from './table.model.js';

export const createTable = async (tableData) => {
  const table = new Table(tableData);
  await table.save();
  return table;
};

// Obtener mesas con paginación y filtros
export const fetchTables = async ({
  page = 1,
  limit = 10,
  isAvailable,
  restaurant,
  status,
  location,
} = {}) => {
  const filter = {};

  // Filtro por estado granular
  if (status) {
    filter.status = status;
  } else if (isAvailable === 'all') {
    // sin filtro
  } else if (isAvailable === 'false' || isAvailable === false) {
    filter.isAvailable = false;
  } else {
    filter.isAvailable = true;
  }

  // Filtro por restaurante (esencial para el admin de restaurante)
  if (restaurant) filter.restaurant = restaurant;

  // Filtro por ubicación dentro del restaurante
  if (location) filter.location = location;

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));

  const [tables, total] = await Promise.all([
    Table.find(filter)
      .populate('restaurant', 'name')
      .sort({ tableNumber: 1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Table.countDocuments(filter),
  ]);

  return {
    tables,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalRecords: total,
      limit: limitNumber,
    },
  };
};

// Obtener mesa por ID
export const fetchTableById = async (id) => {
  return Table.findById(id).populate('restaurant', 'name');
};

// Actualizar mesa
export const updateTable = async ({ id, updateData }) => {
  return Table.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

// Cambiar disponibilidad de la mesa (activa/desactiva)
export const updateTableStatus = async ({ id, isAvailable }) => {
  const status = isAvailable ? 'DISPONIBLE' : 'FUERA_DE_SERVICIO';
  return Table.findByIdAndUpdate(id, { isAvailable, status }, { new: true });
};

// Cambiar estado granular de la mesa
export const updateTableGranularStatus = async ({ id, status }) => {
  return Table.findByIdAndUpdate(id, { status }, { new: true });
};
