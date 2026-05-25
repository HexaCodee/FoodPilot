import { Schema, model } from 'mongoose';

const inventorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del insumo es obligatorio'],
      trim: true,
      maxLength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    quantity: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [0, 'La cantidad no puede ser negativa'],
    },
    unit: {
      type: String,
      required: [true, 'La unidad de medida es obligatoria'],
      trim: true,
      maxLength: [20, 'La unidad no puede exceder 20 caracteres'],
    },
    minStock: {
      type: Number,
      default: 0,
      min: [0, 'El stock mínimo no puede ser negativo'],
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: {
        values: [
          'BEBIDAS',
          'CARNES',
          'VERDURAS',
          'LACTEOS',
          'GRANOS',
          'CONDIMENTOS',
          'LIMPIEZA',
          'OTROS',
        ],
        message: 'Categoría no válida',
      },
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'El inventario debe pertenecer a un restaurante'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

inventorySchema.index({ restaurant: 1 });
inventorySchema.index({ category: 1 });
inventorySchema.index({ restaurant: 1, category: 1 });

export default model('Inventory', inventorySchema);
