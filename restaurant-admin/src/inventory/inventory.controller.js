import {
    createInventoryItem,
    fetchInventory,
    fetchInventoryById,
    updateInventoryItem,
    deleteInventoryItem,
} from './inventory.service.js';

export const createInventoryController = async (req, res) => {
    try {
        const item = await createInventoryItem(req.body);
        res.status(201).json({ success: true, message: 'Insumo creado exitosamente', data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al crear el insumo', error: err.message });
    }
};

export const getInventoryController = async (req, res) => {
    try {
        const { page = 1, limit = 50, restaurant, category } = req.query;
        const result = await fetchInventory({ page, limit, restaurant, category });
        res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al obtener el inventario', error: err.message });
    }
};

export const getInventoryByIdController = async (req, res) => {
    try {
        const item = await fetchInventoryById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Insumo no encontrado' });
        res.status(200).json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al obtener el insumo', error: err.message });
    }
};

export const updateInventoryController = async (req, res) => {
    try {
        const item = await updateInventoryItem({ id: req.params.id, updateData: req.body });
        if (!item) return res.status(404).json({ success: false, message: 'Insumo no encontrado' });
        res.status(200).json({ success: true, message: 'Insumo actualizado', data: item });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Error al actualizar el insumo', error: err.message });
    }
};

export const deleteInventoryController = async (req, res) => {
    try {
        const item = await deleteInventoryItem(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Insumo no encontrado' });
        res.status(200).json({ success: true, message: 'Insumo eliminado' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al eliminar el insumo', error: err.message });
    }
};
