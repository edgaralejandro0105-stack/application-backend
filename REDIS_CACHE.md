# Redis Cache — Documentación de Implementación

## Resumen

Se implementó un sistema de caché con Redis + ioredis que reduce las consultas a PostgreSQL en endpoints GET de alta frecuencia. La caché se invalida automáticamente cuando se mutan datos relacionados.

---

## Arquitectura

```
Cliente → cacheMiddleware (Redis)
              ├── HIT  → Responde desde Redis (sin tocar PostgreSQL)
              └── MISS → Ejecuta query normal → Guarda en Redis con TTL
              
POST/PUT/DELETE → Servicio → Invalida tags relacionados en Redis
```

**Graceful fallback:** Si Redis no está disponible, el middleware se deshabilita solo y la app funciona normalmente sin caché.

---

## Archivos Nuevos

### `src/config/redis.js`
- Conexión configurable vía `REDIS_URL` en `.env`
- `connect()` — intenta conectar al iniciar el servidor
- `getClient()` — retorna el cliente ioredis o `null` si deshabilitado
- `isEnabled()` — verifica si la caché está activa
- Reintentos: 3 intentos antes de deshabilitar
- Escucha eventos `error` y `connect` para auto-deshabilitar/habilitar

### `src/middleware/cache.js`
- `cacheMiddleware(ttlSeconds, tag)` — middleware para rutas GET
- Genera key: `cache:{tag}:{userId}:{path}:{queryString}`
- Si Redis tiene la key → `res.json(JSON.parse(cached))` (sin query a DB)
- Si no → ejecuta la ruta normalmente, intercepta `res.json()` y guarda en Redis
- Respeta autenticación: incluye `user_id` en la key

### `src/utils/cacheInvalidator.js`
- `invalidateTags([...])` — invalida por pattern `cache:*:{tag}:*`
- `invalidateByPattern(pattern)` — invalida por patrón Redis explícito
- Usa `SCAN` + `DEL` en lugar de `KEYS` (no bloquea Redis)

---

## Archivos Modificados

### `package.json`
- Agregado `ioredis` como dependencia

### `.env`
```
REDIS_URL=redis://localhost:6379
CACHE_ENABLED=true
```

### `src/server.js`
- Importa `redis` de `./config/redis`
- Llama `await redis.connect()` al inicio de `startServer()`

### Rutas con caché aplicada

| Ruta | TTL | Tag |
|------|-----|-----|
| `GET /api/dashboard/summary` | 60s | `dashboard` |
| `GET /api/events` | 60s | `events` |
| `GET /api/events/:id` | 60s | `events` |
| `GET /api/events/website/status` | 60s | `events` |
| `GET /api/products` | 120s | `products` |
| `GET /api/products/:id` | 120s | `products` |
| `GET /api/venues` | 300s | `venues` |
| `GET /api/venues/:id` | 300s | `venues` |
| `GET /api/employees` | 120s | `employees` |
| `GET /api/employees/:id` | 120s | `employees` |
| `GET /api/clients` | 120s | `clients` |
| `GET /api/clients/:id` | 120s | `clients` |
| `GET /api/service-external` | 300s | `service-external` |
| `GET /api/service-external/:id` | 300s | `service-external` |
| `GET /api/service-external/event/:eventId` | 60s | `events` |

### Servicios con invalidación

| Servicio | Métodos con invalidación | Tags inválidados |
|----------|--------------------------|-------------------|
| `event.service.js` | createEvent, createWebsiteReservation, updateEvent, deleteEvent, restoreEvent | `events`, `dashboard` |
| `product.service.js` | createProduct, updateProduct, deleteProduct, restoreProduct | `products`, `dashboard` |
| `venue.service.js` | createVenue, updateVenue, deleteVenue, restoreVenue | `venues`, `events`, `dashboard` |
| `employee.service.js` | createEmployee, updateEmployee, deleteEmployee, restoreEmployee | `employees`, `events` |
| `client.service.js` | createClient, updateClient, deleteClient, restoreClient | `clients`, `events` |
| `sale.service.js` | createSale, updateSale, deleteSale | `dashboard` |
| `inventory.service.js` | createInventoryItem, updateInventoryItem, deleteInventoryItem | `products`, `dashboard` |
| `serviceExternal.service.js` | createServiceExternal, updateServiceExternal, deleteServiceExternal, restoreServiceExternal | `service-external`, `events` |

---

## Lo que NO se cachea

- `/api/auth/*` — tokens, sesiones
- `/api/client-portal/*` — datos de autenticación
- `/api/reports/*` — PDF/Excel generados on-demand
- `/api/notifications/*` — tiempo real
- `/api/users/*` — datos administrativos sensibles
- `/api/roles/*` — datos administrativos
- `/api/inventory/*` — histórico de movimientos (datos transaccionales)

---

## Cómo deshabilitar

Para correr sin Redis, simplemente:

```env
CACHE_ENABLED=false
```

La app funciona normalmente, solo sin caché.

---

## Requisitos

Redis debe estar corriendo. Opciones:
- **Local:** `redis://localhost:6379` (instalar Redis localmente)
- **Nube:** `redis://user:pass@host:port` (Redis Cloud, Upstash, etc.)
