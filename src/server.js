require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { strictLimiter, mediumLimiter, standardLimiter, globalLimiter } = require('./middleware/rateLimiter');
const redis = require('./config/redis');

// Base de datos y Modelos centralizados
const { sequelize } = require('./models');


//  RUTAS (Trigger nodemon)
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
const notificationRoutes = require('./routes/notification.routes');
const paymentsRoutes = require('./routes/payments.routes');
const rolesRoutes = require('./routes/roles.routes');
const clientPortalRoutes = require('./routes/clientPortal.routes');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);
const server = require('http').createServer(app);


// Middlewares globales
app.use(helmet());

// CORS Configurado para Vite y Next.js (admite cualquier puerto localhost en desarrollo)
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://lacasonadisco.netlify.app',
    'https://frontend-casona.netlify.app',
    'https://frontendcasona.netlify.app'
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || 
            allowedOrigins.includes(origin) || 
            origin.startsWith('http://localhost:') || 
            origin.startsWith('http://127.0.0.1:') || 
            origin.startsWith('http://192.168.') ||
            (origin && (origin.includes('frontend-casona.netlify.app') || origin.includes('frontendcasona.netlify.app')))) {
            callback(null, true);
        } else {
            console.error('CORS Error: Origin not allowed:', origin);
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

// Rate Limiting por capas — Strict (auth / login)
app.use('/api/auth', strictLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/client-portal', strictLimiter);
app.use('/api/client-portal', clientPortalRoutes);

// Medium (mutaciones / admin)
app.use('/api/clients', mediumLimiter);
app.use('/api/clients', clientRoutes);
app.use('/api/employees', mediumLimiter);
app.use('/api/employees', employeesRoutes);
app.use('/api/inventory', mediumLimiter);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', mediumLimiter);
app.use('/api/sales', salesRoutes);
app.use('/api/venues', mediumLimiter);
app.use('/api/venues', venuesRoutes);
app.use('/api/providers', mediumLimiter);
app.use('/api/providers', providersRoutes);
app.use('/api/users', mediumLimiter);
app.use('/api/users', usersRoutes);

// Standard (lectura / públicos)
app.use('/api/events', standardLimiter);
app.use('/api/events', eventsRoutes);
app.use('/api/products', standardLimiter);
app.use('/api/products', productsRoutes);
app.use('/api/event-items', standardLimiter);
app.use('/api/event-items', eventItemsRoutes);
app.use('/api/event-staff', standardLimiter);
app.use('/api/event-staff', eventStaffRoutes);
app.use('/api/service-external', standardLimiter);
app.use('/api/service-external', serviceExternalRoutes);
app.use('/api/dashboard', standardLimiter);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', standardLimiter);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', standardLimiter);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', standardLimiter);
app.use('/api/payments', paymentsRoutes);
app.use('/api/roles', standardLimiter);
app.use('/api/roles', rolesRoutes);

// Global — catch-all para cualquier ruta /api no clasificada
app.use('/api', globalLimiter);

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
        await redis.connect();

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
        await sequelize.query(`ALTER TYPE "event_status" ADD VALUE IF NOT EXISTS 'Lead';`).catch(() => { });
        await sequelize.query(`ALTER TYPE "event_status" ADD VALUE IF NOT EXISTS 'Finished';`).catch(() => { });

        // 5. Agregar la columna guests a la tabla events si no existe
        await sequelize.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS guests INTEGER DEFAULT 0;`).catch(() => { });

        // 6. Agregar la columna email a la tabla clients
        await sequelize.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS email VARCHAR(255);`).catch(() => { });

        // 7. Ampliar phone a VARCHAR(50) en clients para soportar formatos internacionales
        await sequelize.query(`ALTER TABLE clients ALTER COLUMN phone TYPE VARCHAR(50);`).catch(() => { });

        // 8. Agregar is_active para Soft Delete
        await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`).catch(() => { });
        await sequelize.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`).catch(() => { });
        await sequelize.query(`ALTER TABLE services_external ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`).catch(() => { });

        // 9. Nuevos campos visuales para frontend (products, events, venues)
        await sequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);`).catch(() => { });
        await sequelize.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS title VARCHAR(100);`).catch(() => { });
        await sequelize.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT;`).catch(() => { });
        await sequelize.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS dj VARCHAR(100);`).catch(() => { });
        await sequelize.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);`).catch(() => { });
        await sequelize.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS description TEXT;`).catch(() => { });
        await sequelize.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);`).catch(() => { });
        await sequelize.query(`ALTER TABLE services_external ADD COLUMN IF NOT EXISTS description TEXT;`).catch(() => { });
        await sequelize.query(`ALTER TABLE services_external ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);`).catch(() => { });

        // 10. Agregar columna simulated a payments si no existe
        await sequelize.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS simulated BOOLEAN DEFAULT TRUE;`).catch(() => { });

        // 11. Agregar due_date a sales para vencimiento de facturas
        await sequelize.query(`ALTER TABLE sales ADD COLUMN IF NOT EXISTS due_date DATE;`).catch(() => { });

        // Planner Pricing
        await sequelize.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2) DEFAULT 0.00;`).catch(() => { });
        await sequelize.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary_per_event DECIMAL(10, 2) DEFAULT 0.00;`).catch(() => { });
        await sequelize.query(`ALTER TABLE providers ADD COLUMN IF NOT EXISTS category VARCHAR(100);`).catch(() => { });
        await sequelize.query(`ALTER TABLE providers ADD COLUMN IF NOT EXISTS rif VARCHAR(20);`).catch(() => { });
        await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);`).catch(() => { });

        // ─── Consolidar roles duplicados ─────────────────────────────────────
        // Unificar "admin" y "Administrador" bajo un solo nombre
        await sequelize.query(`
          UPDATE users SET role_id = (
            SELECT id FROM rol WHERE LOWER(TRIM(role_name)) = 'administrador' LIMIT 1
          ) WHERE role_id IN (
            SELECT id FROM rol WHERE LOWER(TRIM(role_name)) = 'admin'
          );
        `).catch(() => { });
        await sequelize.query(`
          DELETE FROM rol WHERE LOWER(TRIM(role_name)) = 'admin'
          AND id NOT IN (SELECT MIN(id) FROM rol WHERE LOWER(TRIM(role_name)) = 'admin');
        `).catch(() => { });

        // ─── Limpiar roles duplicados ──────────────────────────────────────────
        await sequelize.query(`
            DELETE FROM rol WHERE id NOT IN (
                SELECT MIN(id) FROM rol GROUP BY LOWER(TRIM(role_name))
            );
        `).catch(() => { });

        // ─── Sincronización normal ─────────────────────────────────────────────
        // sync() crea tablas que falten pero NO altera las existentes.
        // Esto evita conflictos de ENUM entre tipos user_status y enum_users_status.
        await sequelize.sync();
        console.log('✅ Base de datos sincronizada exitosamente');

        // 10. Migración de venue_id a EventVenues (Muchos a Muchos)
        await sequelize.query(`
            INSERT INTO event_venues (event_id, venue_id)
            SELECT event_id, venue_id FROM events
            WHERE venue_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM event_venues ev WHERE ev.event_id = events.event_id AND ev.venue_id = events.venue_id
            );
        `).catch((err) => { console.error('Error migrando venues:', err); });


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
