import { Schema, model } from 'mongoose';

const promotionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      maxLength: [100, 'El título no puede exceder 100 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxLength: [20, 'El código no puede exceder 20 caracteres'],
    },
    discount: {
      type: Number,
      min: [0, 'El descuento no puede ser negativo'],
      max: [100, 'El descuento no puede superar el 100%'],
      default: 0,
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'La promoción debe pertenecer a un restaurante'],
    },
    validFrom: { type: Date },
    validTo: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

promotionSchema.index({ restaurant: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ validTo: 1 });

export default model('Promotion', promotionSchema);
