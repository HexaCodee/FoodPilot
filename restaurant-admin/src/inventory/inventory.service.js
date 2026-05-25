import Inventory from './inventory.model.js';

export const createInventoryItem = async (data) => {
  const item = new Inventory(data);
  await item.save();
  return item;
};

export const fetchInventory = async ({ restaurant, category, page = 1, limit = 50 } = {}) => {
  const filter = {};
  if (restaurant) filter.restaurant = restaurant;
  if (category && category !== 'all') filter.category = category;

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));

  const [items, total] = await Promise.all([
    Inventory.find(filter)
      .populate('restaurant', 'name category')
      .sort({ category: 1, name: 1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Inventory.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalRecords: total,
      limit: limitNumber,
    },
  };
};

export const fetchInventoryById = async (id) => {
  return Inventory.findById(id).populate('restaurant', 'name category');
};

export const updateInventoryItem = async ({ id, updateData }) => {
  return Inventory.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

export const deleteInventoryItem = async (id) => {
  return Inventory.findByIdAndDelete(id);
};
