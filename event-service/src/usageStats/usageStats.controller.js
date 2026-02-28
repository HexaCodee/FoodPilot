import UsageStats from './usageStats.model.js';

export const getAllUsageStats = async (req, res) => {
    try {
        const stats = await UsageStats.find();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener estadísticas de uso' });
    }
};

export const getUsageStatsById = async (req, res) => {
    try {
        const stats = await UsageStats.findById(req.params.id);
        if (!stats) return res.status(404).json({ error: 'Estadística no encontrada' });
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la estadística' });
    }
};

export const createUsageStats = async (req, res) => {
    try {
        const stats = new UsageStats(req.body);
        await stats.save();
        res.status(201).json(stats);
    } catch (error) {
        res.status(400).json({ error: 'Error al crear la estadística', details: error.message });
    }
};

export const updateUsageStats = async (req, res) => {
    try {
        const stats = await UsageStats.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!stats) return res.status(404).json({ error: 'Estadística no encontrada' });
        res.json(stats);
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar la estadística', details: error.message });
    }
};

export const deleteUsageStats = async (req, res) => {
    try {
        const stats = await UsageStats.findByIdAndDelete(req.params.id);
        if (!stats) return res.status(404).json({ error: 'Estadística no encontrada' });
        res.json({ message: 'Estadística eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la estadística' });
    }
};
