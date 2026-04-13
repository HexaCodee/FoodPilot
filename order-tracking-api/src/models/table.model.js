// Importar Mongoose para definición de esquema
const mongoose = require('mongoose');

// Definir el esquema para Table
const tableSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['DISPONIBLE', 'RESERVADA', 'OCUPADA'],
        default: 'DISPONIBLE'
    }
}, { timestamps: true });

// Exportar el modelo Table
module.exports = mongoose.model('Table', tableSchema);
