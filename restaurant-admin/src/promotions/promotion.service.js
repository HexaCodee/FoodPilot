import Promotion from './promotion.model.js';

export const createPromotion = async (data) => {
    const promo = new Promotion(data);
    await promo.save();
    return promo;
};

export const fetchPromotions = async ({ restaurant, isActive, page = 1, limit = 50 } = {}) => {
    const filter = {};
    if (restaurant) filter.restaurant = restaurant;
    if (isActive === 'true' || isActive === true) filter.isActive = true;
    if (isActive === 'false' || isActive === false) filter.isActive = false;

    const pageNumber  = Math.max(1, parseInt(page));
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));

    const [promotions, total] = await Promise.all([
        Promotion.find(filter)
            .populate('restaurant', 'name category')
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber),
        Promotion.countDocuments(filter),
    ]);

    return {
        promotions,
        pagination: { currentPage: pageNumber, totalPages: Math.ceil(total / limitNumber), totalRecords: total, limit: limitNumber },
    };
};

export const fetchPromotionById = async (id) => Promotion.findById(id).populate('restaurant', 'name category');

export const updatePromotion = async ({ id, updateData }) =>
    Promotion.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

export const deletePromotion = async (id) => Promotion.findByIdAndDelete(id);
