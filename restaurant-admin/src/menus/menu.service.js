import Menu from './menu.model.js';

export const createMenu = async (menuData) => {
    try {
        const data = { ...menuData };
        const menu = new Menu(data);
        await menu.save();
        return menu;
    } catch (error) {
        throw error;
    }
};
