import mongoose from 'mongoose';

const usageStatsSchema = new mongoose.Schema(
    {
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'El restaurante es obligatorio'],
            ref: 'Restaurant',
        },

        period: {
            type: {
                type: String,
                enum: {
                    values: ['DÍA', 'SEMANA', 'MES'],
                    message: 'El periodo no es válido',
                },
                required: [true, 'El tipo de periodo es obligatorio'],
            },
            startDate: Date,
            endDate: Date,
        },

        reservationsCount: {
            type: Number,
            default: 0,
            min: [0, 'Las reservas no pueden ser negativas'],
        },

        eventReservations: {
            type: Number,
            default: 0,
            min: [0, 'Las reservas de eventos no pueden ser negativas'],
        },

        mostBusyHour: {
            type: String,
            trim: true,
            maxLength: [10, 'La hora no puede exceder 10 caracteres'],
        },

        newUsers: {
            type: Number,
            default: 0,
            min: [0, 'Los nuevos usuarios no pueden ser negativos'],
        },

        repeatUsers: {
            type: Number,
            default: 0,
            min: [0, 'Los usuarios recurrentes no pueden ser negativos'],
        },

        generatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model('UsageStats', usageStatsSchema);
