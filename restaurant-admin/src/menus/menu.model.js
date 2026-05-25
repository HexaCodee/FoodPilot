import { Schema, model } from 'mongoose';

const menuSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del platillo es obligatorio'],
      trim: true,
      maxLength: [100, 'No puede exceder 100 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio debe ser mayor o igual a 0'],
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: {
        values: ['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA', 'DESAYUNO', 'COMBO'],
        message: 'La categoría no es válida',
      },
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'El menú debe pertenecer a un restaurante'],
    },
    ingredients: [{ type: String, trim: true }],
    image: {
      type: String,
      trim: true,
    },
    preparationTime: {
      type: Number,
      min: [1, 'El tiempo de preparación debe ser al menos 1 minuto'],
    },
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

menuSchema.index({ restaurant: 1 });
menuSchema.index({ category: 1 });
menuSchema.index({ isAvailable: 1 });
menuSchema.index({ restaurant: 1, category: 1 });
menuSchema.index({ isVegetarian: 1 });
menuSchema.index({ isVegan: 1 });

export default model('Menu', menuSchema);
