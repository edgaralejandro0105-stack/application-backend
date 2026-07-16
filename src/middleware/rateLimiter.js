const rateLimit = require('express-rate-limit');

const isProd = process.env.NODE_ENV === 'production';
const windowMs = 15 * 60 * 1000;

const send429 = (message, req, res) => {
    if (res.headersSent) return;
    res.status(429).json({ status: 'error', message });
};

const store = new Map();
const LOGIN_MAX = 5;
const LOGIN_WINDOW = 15 * 60 * 1000;

function loginLimiter(req, res, next) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store.has(ip)) {
        store.set(ip, []);
    }

    const timestamps = store.get(ip).filter(t => now - t < LOGIN_WINDOW);
    store.set(ip, timestamps);

    if (timestamps.length >= LOGIN_MAX) {
        send429('Demasiados intentos de inicio de sesión. Intente de nuevo en 15 minutos.', req, res);
        return;
    }

    timestamps.push(now);
    next();
}

setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of store) {
        const valid = timestamps.filter(t => now - t < LOGIN_WINDOW);
        if (valid.length === 0) store.delete(ip);
        else store.set(ip, valid);
    }
}, 60000);

const mediumLimiter = rateLimit({
    windowMs,
    max: isProd ? 50 : 15,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        send429('Demasiadas peticiones. Intente de nuevo en 15 minutos.', req, res);
    }
});

const standardLimiter = rateLimit({
    windowMs,
    max: isProd ? 100 : 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        send429('Demasiadas peticiones. Intente de nuevo en 15 minutos.', req, res);
    }
});

const globalLimiter = rateLimit({
    windowMs,
    max: isProd ? 200 : 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        send429('Demasiadas peticiones. Intente de nuevo en 15 minutos.', req, res);
    }
});

module.exports = { loginLimiter, mediumLimiter, standardLimiter, globalLimiter };