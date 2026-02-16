import { Schema, model } from "mongoose";

const menuSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre del platillo es obligatorio'],
        trim: true,
        max: [100, 'No puede exceder 100 caracteres']
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio debe ser mayor o igual a 0']
    },
    description: {
        type: String,
        trim: true,
        maxLength: [300, 'La descripción no puede exceder 300 caracteres']
    },
    category: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
        enum: {
            values: ['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA'],
            message: 'La categoría no es válida'
        }
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El menú debe pertenecer a un restaurante']
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true,
    versionKey: false,
});

menuSchema.index({ restaurant: 1 });
menuSchema.index({ category: 1 });
menuSchema.index({ isAvailable: 1 });

export default model('Menu', menuSchema);
