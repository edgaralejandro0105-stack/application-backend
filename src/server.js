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

// 2. IMPORTA LAS RUTAS
const authRoutes = require('./routes/auth.routes');
const clientRoutes = require('./routes/client.routes');
const employeesRoutes = require('./routes/employees.routes');
const eventsRoutes = require('./routes/events.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const salesRoutes = require('./routes/sales.routes');
const venuesRoutes = require('./routes/venues.routes');
const productsRoutes = require('./routes/products.routes');
const usersRoutes = require('./routes/users.routes');
const eventItemsRoutes = require('./routes/event-items.routes');
const eventStaffRoutes = require('./routes/event-staff.routes');
const serviceExternalRoutes = require('./routes/service-external.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middlewares globales
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/event-items', eventItemsRoutes);
app.use('/api/event-staff', eventStaffRoutes);
app.use('/api/service-external', serviceExternalRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: "Backend API Eventos Francisco - Activo" });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// 2. SINCRONIZACIÓN Y ARRANQUE
// Usamos una función asíncrona para asegurar que la DB esté lista antes que el servidor
async function startServer() {
    try {
        // Sincroniza los modelos con la base de datos
        // force: true elimina y recrea las tablas (útil para desarrollo)
        await sequelize.sync({ force: true });
        console.log('✅ Base de datos sincronizada exitosamente');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar/sincronizar la base de datos:', error);
    }
}

startServer();