import mongoose from 'mongoose';

const topProductSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: [true, 'El producto es obligatorio'],
    },
    name: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        trim: true,
        maxLength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    quantitySold: {
        type: Number,
        default: 0,
        min: [0, 'La cantidad vendida no puede ser negativa'],
    },
});

const salesReportSchema = new mongoose.Schema(
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
                    values: ['DÍA', 'SEMANA', 'MES', 'AÑO'],
                    message: 'El periodo no es válido',
                },
                required: [true, 'El tipo de periodo es obligatorio'],
            },
            year: {
                type: Number,
                min: [2000, 'El año debe ser mayor a 2000'],
            },
            month: {
                type: Number,
                min: [1, 'El mes debe ser válido'],
                max: [12, 'El mes debe ser válido'],
            },
            startDate: Date,
            endDate: Date,
        },

        totalSales: {
            type: Number,
            required: [true, 'Las ventas totales son obligatorias'],
            min: [0, 'Las ventas totales no pueden ser negativas'],
        },

        totalOrders: {
            type: Number,
            required: [true, 'El total de órdenes es obligatorio'],
            min: [0, 'El total de órdenes no puede ser negativo'],
        },

        averageTicket: {
            type: Number,
            min: [0, 'El ticket promedio no puede ser negativo'],
        },

        salesByType: {
            dineIn: { type: Number, default: 0, min: [0, 'No puede ser negativo'] },
            delivery: { type: Number, default: 0, min: [0, 'No puede ser negativo'] },
            event: { type: Number, default: 0, min: [0, 'No puede ser negativo'] },
        },

        topProducts: [topProductSchema],

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

export default mongoose.model('SalesReport', salesReportSchema);
