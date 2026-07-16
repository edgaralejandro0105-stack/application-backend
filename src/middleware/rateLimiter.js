const rateLimit = require('express-rate-limit');

const isProd = process.env.NODE_ENV === 'production';
const windowMs = 15 * 60 * 1000;

const send429 = (message, req, res) => {
    res.status(429).json({
        status: 'error',
        message
    });
};

const strictLimiter = rateLimit({
    windowMs,
    max: isProd ? 10 : 3000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        send429('Demasiados intentos de autenticación. Intente de nuevo en 15 minutos.', req, res);
    }
});

const mediumLimiter = rateLimit({
    windowMs,
    max: isProd ? 50 : 3000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        send429('Demasiadas peticiones. Intente de nuevo en 15 minutos.', req, res);
    }
});

const standardLimiter = rateLimit({
    windowMs,
    max: isProd ? 100 : 3000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        send429('Demasiadas peticiones. Intente de nuevo en 15 minutos.', req, res);
    }
});

const globalLimiter = rateLimit({
    windowMs,
    max: isProd ? 200 : 3000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        send429('Demasiadas peticiones. Intente de nuevo en 15 minutos.', req, res);
    }
});

module.exports = { strictLimiter, mediumLimiter, standardLimiter, globalLimiter };
