import Event from './event.model.js';

export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener eventos' });
    }
};

export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el evento' });
    }
};

export const createEvent = async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ error: 'Error al crear el evento', details: error.message });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
        res.json(event);
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar el evento', details: error.message });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
        res.json({ message: 'Evento eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el evento' });
    }
};
