// Importar Mongoose para conexión a MongoDB
const mongoose = require('mongoose');

// Función para conectar a la base de datos
const connectDB = async () => {
    try {
        // Conectar usando la URI de MongoDB de las variables de entorno
        const uri = process.env.URI_MONGODB || process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('Base de datos conectada correctamente');
    } catch (error) {
        console.error('Error conectando la base de datos:', error);
        // Salir del proceso en caso de error de conexión
        process.exit(1);
    }
};

// Exportar la función de conexión
module.exports = connectDB;