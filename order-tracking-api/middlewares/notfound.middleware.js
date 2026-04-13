// Middleware para manejar errores 404 no encontrado
module.exports = (req, res) => {
    // Enviar respuesta 404 para rutas no coincidentes
    res.status(404).json({ message: 'Ruta no encontrada' });
};