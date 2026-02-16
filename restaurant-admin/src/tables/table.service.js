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
