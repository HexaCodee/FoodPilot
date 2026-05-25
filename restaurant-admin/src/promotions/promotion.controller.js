import { createPromotion, fetchPromotions, fetchPromotionById, updatePromotion, deletePromotion } from './promotion.service.js';

export const createPromotionController = async (req, res) => {
    try {
        const promo = await createPromotion(req.body);
        res.status(201).json({ success: true, message: 'Promoción creada', data: promo });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al crear la promoción', error: err.message });
    }
};

export const getPromotionsController = async (req, res) => {
    try {
        const { restaurant, isActive, page = 1, limit = 50 } = req.query;
        const result = await fetchPromotions({ restaurant, isActive, page, limit });
        res.status(200).json({ success: true, data: result.promotions, pagination: result.pagination });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al obtener promociones', error: err.message });
    }
};

export const getPromotionByIdController = async (req, res) => {
    try {
        const promo = await fetchPromotionById(req.params.id);
        if (!promo) return res.status(404).json({ success: false, message: 'Promoción no encontrada' });
        res.status(200).json({ success: true, data: promo });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al obtener la promoción', error: err.message });
    }
};

export const updatePromotionController = async (req, res) => {
    try {
        const promo = await updatePromotion({ id: req.params.id, updateData: req.body });
        if (!promo) return res.status(404).json({ success: false, message: 'Promoción no encontrada' });
        res.status(200).json({ success: true, message: 'Promoción actualizada', data: promo });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Error al actualizar la promoción', error: err.message });
    }
};

export const deletePromotionController = async (req, res) => {
    try {
        const promo = await deletePromotion(req.params.id);
        if (!promo) return res.status(404).json({ success: false, message: 'Promoción no encontrada' });
        res.status(200).json({ success: true, message: 'Promoción eliminada' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error al eliminar la promoción', error: err.message });
    }
};
