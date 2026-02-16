import { Schema, model } from "mongoose";

const restaurantSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre del restaurante es obligatorio'],
        trim: true,
        max: [100, 'El nombre no puede exceder los 100 caracteres'],
    },
    address: {
        type: String,
        required: [true, 'La dirección es obligatoria'],
        trim: true,
        maxLength: [200, 'La dirección no puede exceder 200 caracteres'],
    },
    phone: {
        type: String,
        required: [true, 'El número de teléfono es obligatorio'],
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'La categoría del restaurante es obligatoria'],
        enum: {
            values: ['FAST_FOOD', 'FORMAL', 'CAFETERIA'],
            message: 'La categoría no es válida'
        }
    },
    isActive: {
        type: Boolean,
        default: true,
    },
},
{
    timestamps: true,
    versionKey: false,
});

// Índices
restaurantSchema.index({ isActive: 1 });
restaurantSchema.index({ category: 1 });
restaurantSchema.index({ isActive: 1, category: 1 });

export default model('Restaurant', restaurantSchema);
