import {
    fetchMenus,
    fetchMenuById,
    createMenu,
    updateMenu,
    updateMenuStatus,
} from './menu.service.js';

// Crear menú
export const createMenuController = async (req, res) => {
    try {
        const menu = await createMenu(req.body);
        res.status(201).json({
            success: true,
            message: 'Platillo registrado exitosamente',
            data: menu,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar el platillo',
            error: err.message,
        });
    }
};

// Obtener todos los menús con paginación y filtros
export const getMenusController = async (req, res) => {
    try {
        const { page = 1, limit = 10, isAvailable = true } = req.query;
        const { menus, pagination } = await fetchMenus({ page, limit, isAvailable });
        res.status(200).json({
            success: true,
            data: menus,
            pagination,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los menús',
            error: error.message,
        });
    }
};

// Obtener menú por ID
export const getMenuByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const menu = await fetchMenuById(id);
        if (!menu) {
            return res.status(404).json({
                success: false,
                message: 'Menú no encontrado',
            });
        }
        res.status(200).json({
            success: true,
            data: menu,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el menú',
            error: error.message,
        });
    }
};

// Actualizar menú
export const updateMenuController = async (req, res) => {
    try {
        const { id } = req.params;
        const menu = await updateMenu({ id, updateData: req.body });
        if (!menu) {
            return res.status(404).json({
                success: false,
                message: 'Menú no encontrado',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Menú actualizado exitosamente',
            data: menu,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el menú',
            error: error.message,
        });
    }
};

// Cambiar estado del menú (activar/desactivar)
export const changeMenuStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const isAvailable = req.url.includes('/activate');
        const action = isAvailable ? 'activado' : 'desactivado';
        const menu = await updateMenuStatus({ id, isAvailable });
        if (!menu) {
            return res.status(404).json({
                success: false,
                message: 'Menú no encontrado',
            });
        }
        res.status(200).json({
            success: true,
            message: `Menú ${action} exitosamente`,
            data: menu,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del menú',
            error: error.message,
        });
    }
};
