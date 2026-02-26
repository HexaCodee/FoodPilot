import { Router } from "express";
import { validateCreateTable } from "../../middlewares/table-validator.js";

const router = Router();

import {
    createTableController,
    getTablesController,
    getTableByIdController,
    updateTableController,
    changeTableStatusController
} from "./table.controller.js";

// Crear mesa
router.post('/', validateCreateTable, createTableController);

// Listar mesas
router.get('/', getTablesController);

// Obtener mesa por ID
router.get('/:id', getTableByIdController);

// Actualizar mesa
router.put('/:id', updateTableController);

// Cambiar estado (activar/desactivar)
router.patch('/:id/activate', changeTableStatusController);
router.patch('/:id/deactivate', changeTableStatusController);

export default router;
