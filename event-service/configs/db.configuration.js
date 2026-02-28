import mongoose from 'mongoose';

export const dbConnection = async () => {
    try {
        mongoose.connection.on('error', () => {
            console.error('Mongo DB | Error de conexion');
            mongoose.disconnect();
        });
        mongoose.connection.on('connecting', () => {
            console.log('Mongo DB | Intentando conectar con mongo DB');
        });
        mongoose.connection.on('connected', () => {
            console.log('Mongo DB | Conectado a mongo DB');
        });
        mongoose.connection.on('open', () => {
            console.log('Mongo DB | Conectado a la base de datos');
        });
        mongoose.connection.on('reconnected', () => {
            console.log('Mongo DB | Resonectado a mongo DB');
        });
        mongoose.connection.on('disconnected', () => {
            console.log('Mongo DB | Desconectado de mongo DB');
        });
        await mongoose.connect(process.env.URI_MONGODB, {
            serverSelectionTimeoutMs: 5000,
            maxPoolSize: 10,
        });
    } catch (err) {
        console.error(`FoodPilot - Error al conectar la db: ${err.message}`)
        process.exit(1);
    }
}

const gracefulShutdown = async (signal) => {
    console.log(`Mongo DB | Recibida señal de ${signal}, cerrando conexion a mongo DB...`);
    try{
        await mongoose.disconnect();
        console.log(`Mongo DB | Conexion cerrada exitosamente`)
        process.exit(1);
    }catch(err){
        console.error(`Mongo DB | Error durante el cierre de la conexion: ${err.message}`);
        process.exit(1);
    }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));