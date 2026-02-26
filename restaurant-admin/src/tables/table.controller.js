



import {
    fetchTables,
    fetchTableById,
    createTable,
    updateTable,
    updateTableStatus,
} from './table.service.js';

// Crear mesa
export const createTableController = async (req, res) => {
    try {
        const table = await createTable(req.body);
        res.status(201).json({
            success: true,
            message: 'Mesa registrada exitosamente',
            data: table,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar la mesa',
            error: err.message,
        });
    }
};

// Obtener todas las mesas con paginación y filtros
export const getTablesController = async (req, res) => {
    try {
        const { page = 1, limit = 10, isAvailable = true } = req.query;
        const { tables, pagination } = await fetchTables({ page, limit, isAvailable });
        res.status(200).json({
            success: true,
            data: tables,
            pagination,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las mesas',
            error: error.message,
        });
    }
};

// Obtener mesa por ID
export const getTableByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const table = await fetchTableById(id);
        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada',
            });
        }
        res.status(200).json({
            success: true,
            data: table,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la mesa',
            error: error.message,
        });
    }
};

// Actualizar mesa
export const updateTableController = async (req, res) => {
    try {
        const { id } = req.params;
        const table = await updateTable({ id, updateData: req.body });
        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Mesa actualizada exitosamente',
            data: table,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la mesa',
            error: error.message,
        });
    }
};

// Cambiar estado de la mesa (activar/desactivar)
export const changeTableStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const isAvailable = req.url.includes('/activate');
        const action = isAvailable ? 'activada' : 'desactivada';
        const table = await updateTableStatus({ id, isAvailable });
        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada',
            });
        }
        res.status(200).json({
            success: true,
            message: `Mesa ${action} exitosamente`,
            data: table,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado de la mesa',
            error: error.message,
        });
    }
};
