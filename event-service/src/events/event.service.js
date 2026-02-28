import Event from './event.model.js';

export const createEvent = async (eventData) => {
	try {
		const data = { ...eventData };
		const event = new Event(data);
		await event.save();
		return event;
	} catch (error) {
		throw error;
	}
};

export const fetchEvents = async ({ page = 1, limit = 10, status = 'ACTIVO' }) => {
	const filter = { status };
	const pageNumber = parseInt(page);
	const limitNumber = parseInt(limit);

	const events = await Event.find(filter)
		.limit(limitNumber)
		.skip((pageNumber - 1) * limitNumber)
		.sort({ createdAt: -1 });

	const total = await Event.countDocuments(filter);

	return {
		events,
		pagination: {
			currentPage: pageNumber,
			totalPages: Math.ceil(total / limitNumber),
			totalRecords: total,
			limit: limitNumber,
		},
	};
};

export const fetchEventById = async (id) => {
	return await Event.findById(id);
};

export const updateEvent = async (id, eventData) => {
	return await Event.findByIdAndUpdate(id, eventData, { new: true, runValidators: true });
};

export const updateEventStatus = async (id, status) => {
	return await Event.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
};
