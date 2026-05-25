import { createOrUpdateRating, fetchRatings, deleteRating } from './rating.service.js';

export const createRatingController = async (req, res) => {
  try {
    const { restaurantId, userId, rating, comment } = req.body;
    const result = await createOrUpdateRating({ restaurantId, userId, rating, comment });
    res.status(201).json({ success: true, message: 'Calificación guardada', data: result });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Error al guardar la calificación', error: err.message });
  }
};

export const getRatingsController = async (req, res) => {
  try {
    const { restaurant, userId, page = 1, limit = 20 } = req.query;
    const result = await fetchRatings({ restaurant, userId, page, limit });
    res.status(200).json({ success: true, data: result.ratings, pagination: result.pagination });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Error al obtener las calificaciones', error: err.message });
  }
};

export const deleteRatingController = async (req, res) => {
  try {
    const result = await deleteRating(req.params.id);
    if (!result)
      return res.status(404).json({ success: false, message: 'Calificación no encontrada' });
    res.status(200).json({ success: true, message: 'Calificación eliminada' });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Error al eliminar la calificación', error: err.message });
  }
};
