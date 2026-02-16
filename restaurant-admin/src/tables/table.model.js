import { Schema, model } from "mongoose";

const tableSchema = new Schema({
    tableNumber: {
        type: Number,
        required: [true, 'El número de mesa es obligatorio'],
        min: [1, 'El número debe ser mayor a 0']
    },
    capacity: {
        type: Number,
        required: [true, 'La capacidad es obligatoria'],
        min: [1, 'Debe tener al menos 1 persona']
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'La mesa debe pertenecer a un restaurante']
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

tableSchema.index({ restaurant: 1 });
tableSchema.index({ isAvailable: 1 });

export default model('Table', tableSchema);
