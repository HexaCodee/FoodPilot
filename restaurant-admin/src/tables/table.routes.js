import { Router } from "express";
import { createTableController } from "./table.controller.js";
import { validateCreateTable } from "../../middlewares/table-validator.js";

const router = Router();

router.post(
    '/',
    validateCreateTable,
    createTableController
);

export default router;
