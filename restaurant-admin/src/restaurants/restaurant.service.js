import Restaurant from './restaurant.model.js';

export const createRestaurant = async (restaurantData) => {
    try {
        const data = { ...restaurantData };
        const restaurant = new Restaurant(data);
        await restaurant.save();
        return restaurant;

    } catch (error) {
        throw error;
    }
};


// Obtener todos los restaurantes con paginación y filtros
export const fetchRestaurants = async ({ page = 1, limit = 10, isActive = true }) => {
    const filter = { isActive };
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const restaurants = await Restaurant.find(filter)
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber)
        .sort({ createdAt: -1 });

    const total = await Restaurant.countDocuments(filter);

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
