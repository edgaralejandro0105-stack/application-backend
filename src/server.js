const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// 1. IMPORTA LA CONEXIÓN A LA DB Y LOS MODELOS
const sequelize = require('./config/db');
const Client = require('./models/Client.model');
const User = require('./models/User.model');
const Role = require('./models/Role.model');
// (Importa el resto de tus modelos aquí para que Sequelize los sincronice)

const app = express();

// Middlewares globales
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: "Backend API Eventos Francisco - Activo" });
});

const PORT = process.env.PORT || 3000;

// 2. SINCRONIZACIÓN Y ARRANQUE
// Usamos una función asíncrona para asegurar que la DB esté lista antes que el servidor
async function startServer() {
    try {
        // Sincroniza los modelos con la base de datos
        // alter: true ajusta las tablas si hay cambios en los modelos
        await sequelize.sync({ alter: true });
        console.log('✅ Base de datos sincronizada exitosamente');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar/sincronizar la base de datos:', error);
    }
}

startServer();