import { Router } from "express";
import { createRestaurantController } from "./restaurant.controller.js";
import { validateCreateRestaurant } from "../../middlewares/restaurant-validator.js";

const router = Router();

router.post(
    '/',
    validateCreateRestaurant,
    createRestaurantController
);

export default router;
