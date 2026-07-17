const Redis = require('ioredis');

let client = null;
let enabled = false;
let hasBeenConnected = false;

function getClient() {
    if (!client) {
        const url = process.env.REDIS_URL || 'redis://localhost:6379';
        const isTLS = url.startsWith('rediss://');

        client = new Redis(url, {
            maxRetriesPerRequest: null,
            retryStrategy(times) {
                if (!hasBeenConnected) {
                    if (times > 10) return null;
                    return Math.min(times * 500, 10000);
                }
                return Math.min(times * 500, 30000);
            },
            lazyConnect: true,
            ...(isTLS && { tls: {} }),
            enableReadyCheck: true
        });

        client.on('error', (err) => {
            if (hasBeenConnected) {
                console.warn('⚠ Redis: error de conexión:', err.message);
            }
        });

        client.on('connect', () => {
            console.log('✅ Redis conectado, caché habilitado.');
            enabled = true;
            hasBeenConnected = true;
        });

        client.on('close', () => {
            if (enabled) console.warn('⚠ Redis: conexión cerrada.');
            enabled = false;
        });

        client.on('reconnecting', () => {
            console.log('🔄 Redis: reconectando...');
        });

        client.on('end', () => {
            enabled = false;
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
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Tiempo de conexión agotado (15s)')), 15000)
        );
        await Promise.race([redis.connect(), timeout]);
        enabled = true;
        hasBeenConnected = true;
        console.log('✅ Redis conectado exitosamente.');
    } catch (err) {
        console.warn('⚠ Redis no disponible, caché deshabilitado:', err.message);
        enabled = false;
    }
}

module.exports = { getClient, isEnabled, connect };
