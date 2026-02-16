import { createRestaurant } from "./restaurant.service.js";

export const createRestaurantController = async (req, res) => {
    try {
        const restaurant = await createRestaurant(req.body);

        res.status(201).json({
            success: true,
            message: 'Restaurante registrado exitosamente',
            data: restaurant
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar el restaurante',
            error: err.message
        });
    }
};
