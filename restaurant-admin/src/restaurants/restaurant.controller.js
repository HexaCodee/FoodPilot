



import {
    fetchRestaurants,
    fetchRestaurantById,
    createRestaurant,
    updateRestaurant,
    updateRestaurantStatus,
} from './restaurant.service.js';

// Crear restaurante
export const createRestaurantController = async (req, res) => {
    try {
        const restaurant = await createRestaurant(req.body);
        res.status(201).json({
            success: true,
            message: 'Restaurante registrado exitosamente',
            data: restaurant,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar el restaurante',
            error: err.message,
        });
    }
};

// Obtener todos los restaurantes con paginación y filtros
export const getRestaurantsController = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true } = req.query;
        const { restaurants, pagination } = await fetchRestaurants({ page, limit, isActive });
        res.status(200).json({
            success: true,
            data: restaurants,
            pagination,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los restaurantes',
            error: error.message,
        });
    }
};

// Obtener restaurante por ID
export const getRestaurantByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await fetchRestaurantById(id);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado',
            });
        }
        res.status(200).json({
            success: true,
            data: restaurant,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el restaurante',
            error: error.message,
        });
    }
};

// Actualizar restaurante
export const updateRestaurantController = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await updateRestaurant({ id, updateData: req.body });
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Restaurante actualizado exitosamente',
            data: restaurant,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el restaurante',
            error: error.message,
        });
    }
};

// Cambiar estado del restaurante (activar/desactivar)
export const changeRestaurantStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';
        const restaurant = await updateRestaurantStatus({ id, isActive });
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado',
            });
        }
        res.status(200).json({
            success: true,
            message: `Restaurante ${action} exitosamente`,
            data: restaurant,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del restaurante',
            error: error.message,
        });
    }
};
