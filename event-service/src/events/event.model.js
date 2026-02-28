import mongoose from 'mongoose';

const eventResourceSchema = new mongoose.Schema({
    resourceType: {
        type: String,
        required: [true, 'El tipo de recurso es obligatorio'],
        trim: true,
        maxLength: [50, 'El tipo de recurso no puede exceder 50 caracteres'],
    },
    description: {
        type: String,
        trim: true,
        maxLength: [200, 'La descripción no puede exceder 200 caracteres'],
    },
    quantity: {
        type: Number,
        default: 1,
        min: [1, 'La cantidad debe ser al menos 1'],
    },
});

const eventSchema = new mongoose.Schema(
    {
        restaurant: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                required: [true, 'El restaurante es obligatorio'],
                ref: 'Restaurant',
            },
            name: {
                type: String,
                required: [true, 'El nombre del restaurante es obligatorio'],
                trim: true,
                maxLength: [100, 'El nombre no puede exceder 100 caracteres'],
            },
            category: {
                type: String,
                trim: true,
                maxLength: [50, 'La categoría no puede exceder 50 caracteres'],
            },
        },

        name: {
            type: String,
            required: [true, 'El nombre del evento es obligatorio'],
            trim: true,
            maxLength: [100, 'El nombre no puede exceder 100 caracteres'],
        },

        description: {
            type: String,
            trim: true,
            maxLength: [300, 'La descripción no puede exceder 300 caracteres'],
        },

        date: {
            type: Date,
            required: [true, 'La fecha del evento es obligatoria'],
        },

        startTime: {
            type: String,
            trim: true,
            maxLength: [10, 'La hora de inicio no puede exceder 10 caracteres'],
        },
        endTime: {
            type: String,
            trim: true,
            maxLength: [10, 'La hora de fin no puede exceder 10 caracteres'],
        },

        maxCapacity: {
            type: Number,
            required: [true, 'La capacidad máxima es obligatoria'],
            min: [1, 'La capacidad debe ser al menos 1'],
        },

        currentReservations: {
            type: Number,
            default: 0,
            min: [0, 'Las reservas actuales no pueden ser negativas'],
        },

        price: {
            type: Number,
            required: [true, 'El precio es obligatorio'],
            min: [0, 'El precio debe ser mayor o igual a 0'],
        },

        status: {
            type: String,
            enum: {
                values: ['ACTIVO', 'INACTIVO', 'CANCELADO'],
                message: 'El estado no es válido',
            },
            default: 'ACTIVO',
        },

        resources: [eventResourceSchema],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model('Event', eventSchema);
