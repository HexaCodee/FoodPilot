import SalesReport from './salesReport.model.js';

export const getAllSalesReports = async (req, res) => {
    try {
        const reports = await SalesReport.find();
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reportes de ventas' });
    }
};

export const getSalesReportById = async (req, res) => {
    try {
        const report = await SalesReport.findById(req.params.id);
        if (!report) return res.status(404).json({ error: 'Reporte no encontrado' });
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el reporte' });
    }
};

export const createSalesReport = async (req, res) => {
    try {
        const report = new SalesReport(req.body);
        await report.save();
        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ error: 'Error al crear el reporte', details: error.message });
    }
};

export const updateSalesReport = async (req, res) => {
    try {
        const report = await SalesReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!report) return res.status(404).json({ error: 'Reporte no encontrado' });
        res.json(report);
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar el reporte', details: error.message });
    }
};

export const deleteSalesReport = async (req, res) => {
    try {
        const report = await SalesReport.findByIdAndDelete(req.params.id);
        if (!report) return res.status(404).json({ error: 'Reporte no encontrado' });
        res.json({ message: 'Reporte eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el reporte' });
    }
};
