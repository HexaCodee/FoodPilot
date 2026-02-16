import { createMenu } from "./menu.service.js";

export const createMenuController = async (req, res) => {
    try {
        const menu = await createMenu(req.body);

        res.status(201).json({
            success: true,
            message: 'Platillo registrado exitosamente',
            data: menu
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar el platillo',
            error: err.message
        });
    }
};
