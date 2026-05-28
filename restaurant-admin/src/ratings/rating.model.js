import { Schema, model } from 'mongoose';

const ratingSchema = new Schema(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'La calificación debe pertenecer a un restaurante'],
    },
    userId: {
      type: String,
      required: [true, 'El ID del usuario es obligatorio'],
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      required: [true, 'La calificación es obligatoria'],
      min: [1, 'La calificación mínima es 1'],
      max: [5, 'La calificación máxima es 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxLength: [500, 'El comentario no puede exceder 500 caracteres'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ratingSchema.index({ restaurant: 1 });
ratingSchema.index({ userId: 1 });
ratingSchema.index({ restaurant: 1, userId: 1 }, { unique: true });

export default model('Rating', ratingSchema);
