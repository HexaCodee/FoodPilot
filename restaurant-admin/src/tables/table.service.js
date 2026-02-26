import Table from './table.model.js';

export const createTable = async (tableData) => {
    try {
        const data = { ...tableData };
        const table = new Table(data);
        await table.save();
        return table;

    } catch (error) {
        throw error;
    }
};


// Obtener todas las mesas con paginación y filtros
export const fetchTables = async ({ page = 1, limit = 10, isAvailable = true }) => {
    const filter = { isAvailable };
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const tables = await Table.find(filter)
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber)
        .sort({ createdAt: -1 });

    const total = await Table.countDocuments(filter);

    return {
        tables,
        pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            totalRecords: total,
            limit: limitNumber,
        },
    };
};

// Obtener mesa por ID
export const fetchTableById = async (id) => {
    return Table.findById(id);
};

// Actualizar mesa
export const updateTable = async ({ id, updateData }) => {
    return Table.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
};

// Cambiar estado de la mesa (activar/desactivar)
export const updateTableStatus = async ({ id, isAvailable }) => {
    return Table.findByIdAndUpdate(id, { isAvailable }, { new: true });
};
