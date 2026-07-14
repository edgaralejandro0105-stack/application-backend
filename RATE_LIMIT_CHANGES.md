# Rate Limiting por Capas — Documentación de Cambios

## Resumen

Se reemplazó el rate limit global único por un sistema de 4 niveles con distinta severidad según la naturaleza de cada endpoint, protegiendo así contra fuerza bruta en auth y permitiendo mayor tráfico en rutas de solo lectura.

---

## Correcciones aplicadas (13/07/2026)

Tras pruebas, se detectaron y corrigieron dos problemas que impedían que los limiters funcionaran:

1. **`dotenv` cargado después de `rateLimiter`** — El `require('dotenv').config()` estaba en la línea 6, después del `require('./middleware/rateLimiter')` de la línea 5. Si `NODE_ENV=production` estaba en el `.env`, el rateLimiter no lo veía. **Fix:** Se movió `require('dotenv').config()` a la línea 1.

2. **`app.use(path, middleware, router)` no funciona en Express 5** — La sintaxis `app.use('/api/auth', strictLimiter, authRoutes)` no ejecutaba correctamente el middleware antes del Router en Express 5. **Fix:** Se separó cada ruta en dos `app.use`:
   ```js
   app.use('/api/auth', strictLimiter);
   app.use('/api/auth', authRoutes);
   ```

3. **`globalLimiter` interfiere antes que los limiters específicos** — Al estar al inicio, el `globalLimiter` ejecutaba primero, lo que podía causar conflictos. **Fix:** Se movió al final como catch-all para rutas no clasificadas.

4. **Se agregaron `standardHeaders: true` y `legacyHeaders: false`** a todos los limiters para exponer headers `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` en cada respuesta (debugging).

5. **Se reemplazó `message` por `handler`** — `express-rate-limit` v8 + Express 5 tenía problemas enviando objetos con `res.send()`. Ahora cada limiter usa un `handler` explícito que llama `res.status(429).json(...)`, garantizando la respuesta JSON correcta.

6. **Límites de desarrollo reducidos** — Los límites originales en dev (100-1000) eran demasiado altos para testear manualmente. Ahora strict=5, medium=15, standard=30, global=60.

---

## Archivos Modificados

### 1. `src/middleware/rateLimiter.js` (NUEVO)

Archivo que centraliza la configuración de los 4 limiters. Cada uno ajusta su `max` según `NODE_ENV` (producción vs desarrollo). La ventana es de 15 minutos para todos.

| Limiter | Prod (req/15min) | Dev (req/15min) |
|----------|-------------------|------------------|
| `strictLimiter` | 10 | **5** |
| `mediumLimiter` | 50 | **15** |
| `standardLimiter` | 100 | **30** |
| `globalLimiter` | 200 | **60** |

> **Nota:** Los límites de desarrollo se bajaron para facilitar las pruebas. Con 5-6 peticiones al login en menos de 15 min se dispara el 429. En producción los límites son más permisivos pero aún protectores.

### 2. `src/server.js` (MODIFICADO)

**Línea 1** — Se movió `dotenv` al inicio:
```js
require('dotenv').config();  // ← ahora es la línea 1
```

**Línea 6** — Se reemplazó el import:
```js
// Antes
const rateLimit = require('express-rate-limit');

// Después
const { strictLimiter, mediumLimiter, standardLimiter, globalLimiter } = require('./middleware/rateLimiter');
```

**Líneas 87-130** — Se reemplazó el bloque de rutas. Cada ruta tiene ahora dos `app.use` separados (limiter + router) en lugar de uno combinado:

```js
// Antes (NO funcionaba en Express 5)
app.use('/api/auth', strictLimiter, authRoutes);

// Después (SÍ funciona)
app.use('/api/auth', strictLimiter);
app.use('/api/auth', authRoutes);
```

`globalLimiter` se movió al final (línea 130) como catch-all:

```
/api/auth          → strictLimiter    → authRoutes
/api/client-portal → strictLimiter    → clientPortalRoutes
/api/clients       → mediumLimiter    → clientRoutes
/api/employees     → mediumLimiter    → employeesRoutes
/api/inventory     → mediumLimiter    → inventoryRoutes
/api/sales         → mediumLimiter    → salesRoutes
/api/venues        → mediumLimiter    → venuesRoutes
/api/providers     → mediumLimiter    → providersRoutes
/api/users         → mediumLimiter    → usersRoutes
/api/events        → standardLimiter  → eventsRoutes
/api/products      → standardLimiter  → productsRoutes
/api/event-items   → standardLimiter  → eventItemsRoutes
/api/event-staff   → standardLimiter  → eventStaffRoutes
/api/service-external → standardLimiter → serviceExternalRoutes
/api/dashboard     → standardLimiter  → dashboardRoutes
/api/reports       → standardLimiter  → reportsRoutes
/api/notifications → standardLimiter  → notificationRoutes
/api/roles         → standardLimiter  → rolesRoutes
/api/*             → globalLimiter    ← catch-all

---

## Criterio de Clasificación

| Nivel | Criterio | Ejemplos |
|-------|----------|----------|
| **Strict** | Endpoints de autenticación sensibles a fuerza bruta | `POST /login`, `POST /register`, `POST /forgot-password` |
| **Medium** | Operaciones de escritura (POST/PUT/DELETE) protegidas por JWT y roles | `inventory`, `sales`, `users`, `providers` |
| **Standard** | Endpoints de solo lectura o mayormente públicos | `products`, `events`, `dashboard`, `reports` |
| **Global** | Red de seguridad — aplica a todo `/api` como fallback | Cualquier ruta bajo `/api` |

---

## Dependencias

No se agregaron nuevas dependencias. Se reutiliza `express-rate-limit` v8.5.1 ya presente en el proyecto.
