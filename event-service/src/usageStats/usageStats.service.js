import UsageStats from './usageStats.model.js';

export const createUsageStats = async (statsData) => {
	try {
		const data = { ...statsData };
		const stats = new UsageStats(data);
		await stats.save();
		return stats;
	} catch (error) {
		throw error;
	}
};

export const fetchUsageStats = async ({ page = 1, limit = 10 }) => {
	const pageNumber = parseInt(page);
	const limitNumber = parseInt(limit);

	const stats = await UsageStats.find()
		.limit(limitNumber)
		.skip((pageNumber - 1) * limitNumber)
		.sort({ createdAt: -1 });

	const total = await UsageStats.countDocuments();

	return {
		stats,
		pagination: {
			currentPage: pageNumber,
			totalPages: Math.ceil(total / limitNumber),
			totalRecords: total,
			limit: limitNumber,
		},
	};
};

export const fetchUsageStatsById = async (id) => {
	return await UsageStats.findById(id);
};

export const updateUsageStats = async (id, statsData) => {
	return await UsageStats.findByIdAndUpdate(id, statsData, { new: true, runValidators: true });
};

export const removeUsageStats = async (id) => {
	return await UsageStats.findByIdAndDelete(id);
};
