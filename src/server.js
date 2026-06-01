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
const reportsRoutes = require('./routes/reports.routes');
const providersRoutes = require('./routes/providers.routes');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = require('http').createServer(app);


// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 100 : 10000, // 100 en prod, 10000 en dev
    message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.'
});

// Middlewares globales
app.use(helmet());

// CORS Configurado para Vite y Next.js (admite cualquier puerto localhost en desarrollo)
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001'
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Configuración de Socket.io
const { Server } = require('socket.io');
const io = new Server(server, { cors: corsOptions });
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`🔌 Cliente de Socket conectado: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`🔌 Cliente de Socket desconectado: ${socket.id}`);
    });
});

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
app.use('/api/reports', reportsRoutes);
app.use('/api/providers', providersRoutes);

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
        // ─── Fixes puntuales de columnas ───────────────────────────────────────
        // 1. Rellenar timestamps NULL en todas las tablas (evita errores al insertar)
        await sequelize.query(`
            DO $$
            DECLARE r RECORD;
            BEGIN
                FOR r IN
                    SELECT table_name, column_name
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND column_name IN ('create_at','update_at','created_at','updated_at')
                LOOP
                    EXECUTE format(
                        'UPDATE %I SET %I = NOW() WHERE %I IS NULL',
                        r.table_name, r.column_name, r.column_name
                    );
                END LOOP;
            END $$;
        `).catch(() => { });

        // 2. Ampliar password a VARCHAR(255) para hashes SHA-256 de 64 chars
        await sequelize.query(
            `ALTER TABLE users ALTER COLUMN password TYPE VARCHAR(255);`
        ).catch(() => { });

        // 3. Agregar columnas reset_password_token y reset_password_expires si no existen
        await sequelize.query(
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255);`
        ).catch(() => { });
        await sequelize.query(
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;`
        ).catch(() => { });

        // 4. Añadir nuevos estados al ENUM de eventos (Lead, Finished)
        await sequelize.query(`ALTER TYPE "enum_events_status" ADD VALUE IF NOT EXISTS 'Lead';`).catch(() => { });
        await sequelize.query(`ALTER TYPE "enum_events_status" ADD VALUE IF NOT EXISTS 'Finished';`).catch(() => { });

        // 5. Agregar la columna guests a la tabla events si no existe
        await sequelize.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS guests INTEGER DEFAULT 0;`).catch(() => { });

        // ─── Sincronización normal ─────────────────────────────────────────────
        // sync() crea tablas que falten pero NO altera las existentes.
        // Esto evita conflictos de ENUM entre tipos user_status y enum_users_status.
        await sequelize.sync();
        console.log('✅ Base de datos sincronizada exitosamente');

        // [MODIFICACIÓN PARA TESTS]: Verificamos si este archivo se ejecuta directamente con Node o si es importado.
        // Si es importado por Jest/Supertest, NO iniciamos el servidor en el puerto para evitar el error "EADDRINUSE".
        if (require.main === module) {
            server.listen(PORT, () => {
                console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);

                // Inicializar tareas programadas (Cron Jobs)
                const cronService = require('./services/cron.service');
                cronService.init();
            });
        }
    } catch (error) {
        console.error('❌ Error al conectar/sincronizar la base de datos:', error);
    }
}

// [MODIFICACIÓN PARA TESTS]: Solo llamamos a startServer() si se ejecuta directamente con Node.
if (require.main === module) {
    startServer();
}

// [MODIFICACIÓN PARA TESTS]: Exportamos la app para que Supertest pueda usarla e inyectar peticiones en memoria.
module.exports = app;
