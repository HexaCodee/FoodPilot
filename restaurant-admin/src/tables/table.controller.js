import { createTable } from "./table.service.js";

export const createTableController = async (req, res) => {
    try {
        const table = await createTable(req.body);

        res.status(201).json({
            success: true,
            message: 'Mesa registrada exitosamente',
            data: table
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar la mesa',
            error: err.message
        });
    }
};
