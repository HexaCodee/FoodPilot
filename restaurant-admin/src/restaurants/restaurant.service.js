import Restaurant from './restaurant.model.js';

export const createRestaurant = async (restaurantData) => {
  const restaurant = new Restaurant(restaurantData);
  await restaurant.save();
  return restaurant;
};

// Obtener todos los restaurantes con paginación y filtros
export const fetchRestaurants = async ({
  page = 1,
  limit = 10,
  isActive,
  category,
  search,
  adminUserId,
} = {}) => {
  const filter = {};

  // Filtro de estado (por defecto solo activos)
  if (isActive === 'all') {
    // sin filtro
  } else if (isActive === 'false' || isActive === false) {
    filter.isActive = false;
  } else {
    filter.isActive = true;
  }

  // Filtro por categoría
  if (category) filter.category = category;

  // Filtro por administrador asignado
  if (adminUserId) filter.adminUserIds = adminUserId;

  // Búsqueda por nombre o dirección
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter)
      .sort({ rating: -1, createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Restaurant.countDocuments(filter),
  ]);

  return {
    restaurants,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalRecords: total,
      limit: limitNumber,
    },
  };
};

// Obtener restaurante por ID
export const fetchRestaurantById = async (id) => {
  return Restaurant.findById(id);
};

// Actualizar restaurante
export const updateRestaurant = async ({ id, updateData }) => {
  return Restaurant.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

// Cambiar estado del restaurante (activar/desactivar)
export const updateRestaurantStatus = async ({ id, isActive }) => {
  return Restaurant.findByIdAndUpdate(id, { isActive }, { new: true });
};

// Actualizar rating (llamado internamente cuando se crea una reseña)
export const updateRestaurantRating = async ({ id, rating, reviewCount }) => {
  return Restaurant.findByIdAndUpdate(id, { rating, reviewCount }, { new: true });
};

// Asignar administrador a un restaurante
export const assignAdmin = async (id, userId) => {
  return Restaurant.findByIdAndUpdate(
    id,
    { $addToSet: { adminUserIds: userId } },
    { new: true }
  );
};

// Desasignar administrador de un restaurante
export const unassignAdmin = async (id, userId) => {
  return Restaurant.findByIdAndUpdate(
    id,
    { $pull: { adminUserIds: userId } },
    { new: true }
  );
};
