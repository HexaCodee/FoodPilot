import Restaurant from './restaurant.model.js';

export const createRestaurant = async (restaurantData) => {
    try {
        const data = { ...restaurantData };
        const restaurant = new Restaurant(data);
        await restaurant.save();
        return restaurant;

    } catch (error) {
        throw error;
    }
};
