import { Schema, model } from 'mongoose';

const openingHourSchema = new Schema(
  {
    day: {
      type: String,
      enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      required: true,
    },
    open: { type: String, default: '08:00' },
    close: { type: String, default: '22:00' },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const restaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del restaurante es obligatorio'],
      trim: true,
      maxLength: [100, 'El nombre no puede exceder los 100 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, 'La descripción no puede exceder 500 caracteres'],
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
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'La categoría del restaurante es obligatoria'],
      enum: {
        values: [
          'FAST_FOOD',
          'FORMAL',
          'CAFETERIA',
          'ITALIANA',
          'MEXICANA',
          'MARISCOS',
          'PARRILLA',
          'VEGANA',
          'FUSION',
          'DESAYUNOS',
          'SUSHI',
        ],
        message: 'La categoría no es válida',
      },
    },
    averagePrice: {
      type: Number,
      min: [0, 'El precio promedio no puede ser negativo'],
    },
    photos: [{ type: String }],
    openingHours: [openingHourSchema],
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'El rating mínimo es 0'],
      max: [5, 'El rating máximo es 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'El conteo de reseñas no puede ser negativo'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

restaurantSchema.index({ isActive: 1 });
restaurantSchema.index({ category: 1 });
restaurantSchema.index({ isActive: 1, category: 1 });
restaurantSchema.index({ rating: -1 });

export default model('Restaurant', restaurantSchema);
