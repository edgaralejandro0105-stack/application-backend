const { getClient, isEnabled } = require('../config/redis');

function cacheMiddleware(ttlSeconds, tag) {
    return async (req, res, next) => {
        const redis = getClient();
        if (!redis || !isEnabled()) return next();

        if (req.method !== 'GET') return next();

        const key = buildCacheKey(req, tag);

        try {
            const cached = await redis.get(key);
            if (cached) {
                return res.status(200).json(JSON.parse(cached));
            }

            const originalJson = res.json.bind(res);

            res.json = function (body) {
                if (res.statusCode === 200) {
                    redis.set(key, JSON.stringify(body), 'EX', ttlSeconds).catch(() => {});
                }
                return originalJson(body);
            };

            next();
        } catch (err) {
            next();
        }
    };
}

function buildCacheKey(req, tag) {
    const userId = req.user ? req.user.user_id || req.user.client_id : 'anon';
    const queryString = JSON.stringify(req.query);
    const path = req.originalUrl.split('?')[0];
    return `cache:${tag}:${userId}:${path}:${queryString}`;
}

module.exports = cacheMiddleware;
