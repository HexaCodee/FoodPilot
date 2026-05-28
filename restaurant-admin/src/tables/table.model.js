import { Schema, model } from 'mongoose';

const TABLE_STATUSES = ['DISPONIBLE', 'OCUPADA', 'RESERVADA', 'FUERA_DE_SERVICIO'];

const tableSchema = new Schema(
  {
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
    // Días de la semana en que la mesa acepta reservaciones (0=Dom, 1=Lun … 6=Sáb)
    availableDays: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
      validate: {
        validator: (days) => days.every((d) => d >= 0 && d <= 6),
        message: 'Cada día debe ser un número entre 0 y 6',
      },
    },
    // Hora de inicio de reservaciones (formato HH:MM)
    availableFrom: {
      type: String,
      default: '08:00',
      match: [/^\d{2}:\d{2}$/, 'Formato de hora inválido, use HH:MM'],
    },
    // Hora de cierre de reservaciones (formato HH:MM)
    availableTo: {
      type: String,
      default: '22:00',
      match: [/^\d{2}:\d{2}$/, 'Formato de hora inválido, use HH:MM'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Sync isAvailable with status automatically
tableSchema.pre('save', async function () {
  this.isAvailable = this.status === 'DISPONIBLE';
});

tableSchema.pre('findOneAndUpdate', async function () {
  // Mongoose auto-wraps plain objects in $set, so we read from $set
  const update = this.getUpdate();
  const data = update.$set ?? update;

  if (data.status) {
    data.isAvailable = data.status === 'DISPONIBLE';
    if (update.$set) update.$set.isAvailable = data.isAvailable;
    else update.isAvailable = data.isAvailable;
  } else if (typeof data.isAvailable === 'boolean') {
    data.status = data.isAvailable ? 'DISPONIBLE' : 'FUERA_DE_SERVICIO';
    if (update.$set) update.$set.status = data.status;
    else update.status = data.status;
  }
});

tableSchema.index({ restaurant: 1 });
tableSchema.index({ status: 1 });
tableSchema.index({ restaurant: 1, status: 1 });

export default model('Table', tableSchema);
