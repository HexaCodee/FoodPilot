// Middleware de manejo de errores
module.exports = (err, req, res, next) => {
    // Registrar el error en la consola
    console.error(err);

    // Enviar respuesta de error con estado y mensaje
    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor'
    });
};