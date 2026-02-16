import { Router } from "express";
import { createMenuController } from "./menu.controller.js";
import { validateCreateMenu } from "../../middlewares/menu-validator.js";

const router = Router();

router.post(
    '/',
    validateCreateMenu,
    createMenuController
);

export default router;
