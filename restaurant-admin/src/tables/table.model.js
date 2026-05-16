import { Schema, model } from "mongoose";

const TABLE_STATUSES = ['DISPONIBLE', 'OCUPADA', 'RESERVADA', 'FUERA_DE_SERVICIO'];

const tableSchema = new Schema({
    tableNumber: {
        type: Number,
        required: [true, 'El número de mesa es obligatorio'],
        min: [1, 'El número debe ser mayor a 0'],
    },
    capacity: {
        type: Number,
        required: [true, 'La capacidad es obligatoria'],
        min: [1, 'Debe tener al menos 1 persona'],
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'La mesa debe pertenecer a un restaurante'],
    },
    location: {
        type: String,
        trim: true,
        enum: {
            values: ['Interior', 'Terraza', 'Barra', 'Jardín', 'VIP', 'Salón privado'],
            message: 'Ubicación no válida',
        },
    },
    status: {
        type: String,
        enum: {
            values: TABLE_STATUSES,
            message: 'Estado no válido',
        },
        default: 'DISPONIBLE',
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
},
{
    timestamps: true,
    versionKey: false,
});

// Sync isAvailable with status automatically
tableSchema.pre('save', function (next) {
    this.isAvailable = this.status === 'DISPONIBLE';
    next();
});

tableSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.status) {
        update.isAvailable = update.status === 'DISPONIBLE';
    }
    if (typeof update.isAvailable === 'boolean' && !update.status) {
        update.status = update.isAvailable ? 'DISPONIBLE' : 'FUERA_DE_SERVICIO';
    }
    next();
});

tableSchema.index({ restaurant: 1 });
tableSchema.index({ status: 1 });
tableSchema.index({ restaurant: 1, status: 1 });

export default model('Table', tableSchema);
