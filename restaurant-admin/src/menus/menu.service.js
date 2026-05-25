import Menu from './menu.model.js';

export const createMenu = async (menuData) => {
  const menu = new Menu(menuData);
  await menu.save();
  return menu;
};

// Obtener menús con paginación y filtros
export const fetchMenus = async ({
  page = 1,
  limit = 10,
  isAvailable,
  restaurant,
  category,
  search,
} = {}) => {
  const filter = {};

  // Filtro de disponibilidad (por defecto solo disponibles)
  if (isAvailable === 'all') {
    // sin filtro
  } else if (isAvailable === 'false' || isAvailable === false) {
    filter.isAvailable = false;
  } else {
    filter.isAvailable = true;
  }

  // Filtro por restaurante (esencial para el admin de restaurante)
  if (restaurant) filter.restaurant = restaurant;

  // Filtro por categoría
  if (category) filter.category = category;

  // Búsqueda por nombre
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));

  const [menus, total] = await Promise.all([
    Menu.find(filter)
      .populate('restaurant', 'name category')
      .sort({ category: 1, name: 1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Menu.countDocuments(filter),
  ]);

  return {
    menus,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalRecords: total,
      limit: limitNumber,
    },
  };
};

// Obtener menú por ID
export const fetchMenuById = async (id) => {
  return Menu.findById(id).populate('restaurant', 'name category');
};

// Actualizar menú
export const updateMenu = async ({ id, updateData }) => {
  return Menu.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

// Cambiar disponibilidad del menú
export const updateMenuStatus = async ({ id, isAvailable }) => {
  return Menu.findByIdAndUpdate(id, { isAvailable }, { new: true });
};
