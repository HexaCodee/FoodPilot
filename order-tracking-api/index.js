require('dotenv').config();
const app = require('./configs/app');
const connectDB = require('./configs/db.configuration');

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});