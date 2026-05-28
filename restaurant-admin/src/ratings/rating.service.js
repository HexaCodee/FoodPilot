import Rating from './rating.model.js';
import Restaurant from '../restaurants/restaurant.model.js';

export const createOrUpdateRating = async ({ restaurantId, userId, userName, rating, comment }) => {
  const existing = await Rating.findOne({ restaurant: restaurantId, userId });

  let result;
  if (existing) {
    existing.rating = rating;
    existing.comment = comment;
    if (userName) existing.userName = userName;
    result = await existing.save();
  } else {
    result = await Rating.create({ restaurant: restaurantId, userId, userName, rating, comment });
  }

  // Recalculate restaurant average rating
  const agg = await Rating.aggregate([
    { $match: { restaurant: result.restaurant } },
    { $group: { _id: '$restaurant', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (agg.length > 0) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: Math.round(agg[0].avg * 10) / 10,
      reviewCount: agg[0].count,
    });
  }

  return result;
};

export const fetchRatings = async ({ restaurant, userId, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (restaurant) filter.restaurant = restaurant;
  if (userId) filter.userId = userId;

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));

  const [ratings, total] = await Promise.all([
    Rating.find(filter)
      .populate('restaurant', 'name category')
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Rating.countDocuments(filter),
  ]);

  return {
    ratings,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalRecords: total,
      limit: limitNumber,
    },
  };
};

export const deleteRating = async (id) => {
  const rating = await Rating.findByIdAndDelete(id);
  if (rating) {
    // Recalculate after delete
    const agg = await Rating.aggregate([
      { $match: { restaurant: rating.restaurant } },
      { $group: { _id: '$restaurant', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    await Restaurant.findByIdAndUpdate(rating.restaurant, {
      rating: agg.length > 0 ? Math.round(agg[0].avg * 10) / 10 : 0,
      reviewCount: agg.length > 0 ? agg[0].count : 0,
    });
  }
  return rating;
};
