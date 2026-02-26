import { Router } from "express";
// ...existing code...
import { validateCreateMenu } from "../../middlewares/menu-validator.js";

const router = Router();

import {
    createMenuController,
    getMenusController,
    getMenuByIdController,
    updateMenuController,
    changeMenuStatusController
} from "./menu.controller.js";

// Crear menú
router.post('/', validateCreateMenu, createMenuController);

// Listar menús
router.get('/', getMenusController);

// Obtener menú por ID
router.get('/:id', getMenuByIdController);

// Actualizar menú
router.put('/:id', updateMenuController);

// Cambiar estado (activar/desactivar)
router.patch('/:id/activate', changeMenuStatusController);
router.patch('/:id/deactivate', changeMenuStatusController);

export default router;
