const { getClient, isEnabled } = require('../config/redis');

async function invalidateByPattern(pattern) {
    const redis = getClient();
    if (!redis || !isEnabled()) return;

    try {
        let cursor = '0';
        do {
            const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = nextCursor;
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } while (cursor !== '0');
    } catch (err) {
        console.warn('⚠ Cache: error al invalidar patrón:', err.message);
    }
}

async function invalidateTags(tags) {
    const redis = getClient();
    if (!redis || !isEnabled()) return;

    try {
        const tagList = Array.isArray(tags) ? tags : [tags];
        for (const tag of tagList) {
            await invalidateByPattern(`cache:*:${tag}:*`);
        }
    } catch (err) {
        console.warn('⚠ Cache: error al invalidar tags:', err.message);
    }
}

module.exports = { invalidateByPattern, invalidateTags };
