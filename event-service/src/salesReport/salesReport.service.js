import SalesReport from './salesReport.model.js';

export const createSalesReport = async (reportData) => {
	try {
		const data = { ...reportData };
		const report = new SalesReport(data);
		await report.save();
		return report;
	} catch (error) {
		throw error;
	}
};

export const fetchSalesReports = async ({ page = 1, limit = 10 }) => {
	const pageNumber = parseInt(page);
	const limitNumber = parseInt(limit);

	const reports = await SalesReport.find()
		.limit(limitNumber)
		.skip((pageNumber - 1) * limitNumber)
		.sort({ createdAt: -1 });

	const total = await SalesReport.countDocuments();

	return {
		reports,
		pagination: {
			currentPage: pageNumber,
			totalPages: Math.ceil(total / limitNumber),
			totalRecords: total,
			limit: limitNumber,
		},
	};
};

export const fetchSalesReportById = async (id) => {
	return await SalesReport.findById(id);
};

export const updateSalesReport = async (id, reportData) => {
	return await SalesReport.findByIdAndUpdate(id, reportData, { new: true, runValidators: true });
};

export const removeSalesReport = async (id) => {
	return await SalesReport.findByIdAndDelete(id);
};
