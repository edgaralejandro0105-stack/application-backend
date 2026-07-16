const Redis = require('ioredis');

let client = null;
let enabled = false;

function getClient() {
    if (!client) {
        client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                if (times > 3) {
                    console.warn('⚠ Redis: demasiados reintentos, deshabilitando caché.');
                    enabled = false;
                    return null;
                }
                return Math.min(times * 200, 2000);
            },
            lazyConnect: true
        });

        client.on('error', (err) => {
            console.warn('⚠ Redis: error de conexión, caché deshabilitado:', err.message);
            enabled = false;
        });

        client.on('connect', () => {
            console.log('✅ Redis conectado, caché habilitado.');
            enabled = true;
        });
    }

    return client;
}

function isEnabled() {
    return enabled;
}

async function connect() {
    if (process.env.CACHE_ENABLED === 'false') {
        console.log('ℹ Caché deshabilitado por configuración (CACHE_ENABLED=false).');
        enabled = false;
        return;
    }

    const redis = getClient();
    if (!redis) return;

    try {
        await redis.connect();
        enabled = true;
        console.log('✅ Redis conectado exitosamente.');
    } catch (err) {
        console.warn('⚠ Redis no disponible, caché deshabilitado:', err.message);
        enabled = false;
    }
}

module.exports = { getClient, isEnabled, connect };
