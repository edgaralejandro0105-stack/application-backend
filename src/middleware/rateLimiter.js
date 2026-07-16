const rateLimit = require('express-rate-limit');

const isProd = process.env.NODE_ENV === 'production';
const windowMs = 15 * 60 * 1000;

const send429 = (message, req, res) => {
    res.status(429).json({
        status: 'error',
        message
    });
};

const loginLimiter = rateLimit({
    windowMs,
    max: isProd ? 5 : 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        send429('Demasiados intentos de inicio de sesión. Intente de nuevo en 15 minutos.', req, res);
    }
});

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
