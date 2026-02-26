import { Router } from "express";
import {
    createRestaurantController,
    getRestaurantsController,
    getRestaurantByIdController,
    updateRestaurantController,
    changeRestaurantStatusController
} from "./restaurant.controller.js";
import { validateCreateRestaurant } from "../../middlewares/restaurant-validator.js";

const router = Router();


// Crear restaurante
router.post('/', validateCreateRestaurant, createRestaurantController);

// Listar restaurantes
router.get('/', getRestaurantsController);

// Obtener restaurante por ID
router.get('/:id', getRestaurantByIdController);

// Actualizar restaurante
router.put('/:id', updateRestaurantController);

// Cambiar estado (activar/desactivar)
router.patch('/:id/activate', changeRestaurantStatusController);
router.patch('/:id/deactivate', changeRestaurantStatusController);

export default router;
