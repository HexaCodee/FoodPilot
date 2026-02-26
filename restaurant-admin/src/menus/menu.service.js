import Menu from './menu.model.js';

export const createMenu = async (menuData) => {
    try {
        const data = { ...menuData };
        const menu = new Menu(data);
        await menu.save();
        return menu;
    } catch (error) {
        throw error;
    }
};


// Obtener todos los menús con paginación y filtros
export const fetchMenus = async ({ page = 1, limit = 10, isAvailable = true }) => {
    const filter = { isAvailable };
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const menus = await Menu.find(filter)
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber)
        .sort({ createdAt: -1 });

    const total = await Menu.countDocuments(filter);

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
    return Menu.findById(id);
};

// Actualizar menú
export const updateMenu = async ({ id, updateData }) => {
    return Menu.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
};

// Cambiar estado del menú (activar/desactivar)
export const updateMenuStatus = async ({ id, isAvailable }) => {
    return Menu.findByIdAndUpdate(id, { isAvailable }, { new: true });
};
