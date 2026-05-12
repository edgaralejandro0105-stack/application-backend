const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Base de datos y Modelos centralizados
const { sequelize } = require('./models');


//  RUTAS
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

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 peticiones por ventana de tiempo
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.'
});

// Middlewares globales
app.use(helmet());

// CORS Configurado para Vite
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // URL de Vite
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(morgan('dev'));

// Aplicar rate limiter solo a la API
app.use('/api', limiter);

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
    res.json({ message: "Backend  Eventos Francisco - Activo" });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// 2. SINCRONIZACIÓN Y ARRANQUE
async function startServer() {
    try {
        // Sincroniza los modelos con la base de datos
        await sequelize.sync(); 
        console.log('✅ Base de datos sincronizada exitosamente');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar/sincronizar la base de datos:', error);
    }
}

startServer();