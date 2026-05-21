# 📚 La Casona — API Backend

API RESTful para el panel administrativo de gestión de inventarios, eventos y bar de **La Casona**. Construida con Node.js, Express.js y PostgreSQL.

---

## 🚀 Stack Tecnológico

| Herramienta | Versión | Rol |
|---|---|---|
| Node.js | v24+ | Runtime |
| Express.js | ^5.2 | Framework HTTP |
| Sequelize | ^6.37 | ORM |
| PostgreSQL | — | Base de datos relacional |
| Zod | ^4.4 | Validación de esquemas |
| JSON Web Token | ^9.0 | Autenticación |
| Helmet | ^8.1 | Cabeceras de seguridad HTTP |
| express-rate-limit | ^7+ | Protección contra DDoS |
| Morgan | ^1.10 | Logger HTTP |
| Jest | ^30.4 | Framework de pruebas (Testing) |
| Supertest | ^7.2 | Testing de integración HTTP |

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue el patrón de **Clean Architecture** con separación estricta de responsabilidades:

```
src/
├── config/
│   └── db.js                  # Conexión a PostgreSQL (Sequelize)
├── models/
│   ├── index.js               # ⭐ Punto central: importa modelos y define relaciones
│   ├── User.model.js
│   ├── Role.model.js
│   ├── Client.model.js
│   ├── Employee.model.js
│   ├── Event.model.js
│   ├── EventItem.model.js
│   ├── EventStaff.model.js
│   ├── InventoryBar.model.js
│   ├── Paymet.model.js
│   ├── Product.model.js
│   ├── Provider.model.js      # [NUEVO]
│   ├── Catalog.model.js       # [NUEVO]
│   ├── Sale.model.js
│   ├── SaleDetail.model.js
│   ├── ServiceExternal.model.js
│   └── Venue.model.js
├── services/                  # ⭐ Lógica de negocio (Clean Architecture)
│   ├── auth.service.js
│   ├── client.service.js
│   ├── dashboard.service.js
│   ├── employee.service.js
│   ├── event.service.js
│   ├── eventItem.service.js
│   ├── eventStaff.service.js
│   ├── inventory.service.js
│   ├── product.service.js
│   ├── sale.service.js
│   ├── serviceExternal.service.js
│   ├── user.service.js
│   └── venue.service.js
├── controllers/               # Manejo de Request/Response HTTP
├── routes/                    # Definición de endpoints
├── middleware/
│   ├── authMiddleware.js      # JWT + RBAC dinámico
│   ├── errorHandler.js        # Manejador global de errores
│   ├── validateSchema.js      # Validación con Zod
│   └── validateBody.js        # Validación de campos básica (legacy)
├── schemas/                   # Esquemas de validación Zod
│   ├── auth.schema.js
│   ├── client.schema.js
│   ├── employee.schema.js
│   ├── event.schema.js
│   ├── inventory.schema.js
│   ├── product.schema.js
│   ├── sale.schema.js
│   └── venue.schema.js
├── tests/                     # 🧪 Pruebas de Integración y Unitarias
│   └── integration/           # Pruebas de API con Jest y Supertest
└── utils/
    ├── AppError.js            # Clase de error operacional personalizada
    └── catchAsync.js          # Wrapper async para controladores
```

**Flujo de una petición:**
```
Request → Route → [Middleware Auth] → [Validate Schema (Zod)] → Controller → Service → Model (DB) → Response
```

---

## ⚙️ Configuración e Instalación

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd "backend casona"
npm install
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Puerto del servidor
PORT=3000

# Entorno (development | production)
NODE_ENV=development

# Base de datos — Local
DATABASE_URL=postgres://postgres:admin123@localhost:5432/lacasona

# Base de datos — Neon (Producción)
# DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura

# CORS — URL de tu frontend (Vite)
FRONTEND_URL=http://localhost:5173
```

### 3. Iniciar el servidor

```bash
# Desarrollo
npm start

# Con hot-reload (requiere nodemon)
npx nodemon src/server.js
```

---

## 🔐 Seguridad

| Mecanismo | Descripción |
|---|---|
| **JWT** | Token de acceso con expiración de 1 hora. Se envía en el header `Authorization: Bearer <token>` |
| **RBAC** | Control de acceso basado en roles mediante `requireRoles('admin', 'manager')` |
| **Rate Limiting** | Máximo **100 peticiones cada 15 minutos** por IP en todas las rutas `/api/` |
| **CORS** | Solo permite peticiones desde `FRONTEND_URL` (por defecto `http://localhost:5173`) |
| **Helmet** | Configura cabeceras HTTP seguras automáticamente |
| **Zod** | Valida el `req.body` antes de que llegue al controlador o la base de datos |

---

## 🧪 Pruebas y Aseguramiento de Calidad (QA)

El proyecto cuenta con un entorno de pruebas robusto para garantizar la estabilidad de los endpoints.

### 1. Pruebas de Integración Automatizadas
Se utilizan **Jest** y **Supertest** para realizar pruebas de integración (ej. `api.test.js`). Estas pruebas verifican:
- Códigos de estado HTTP correctos (200, 201, 400, 401, etc.).
- Respuestas en formato JSON validadas estrictamente con esquemas Zod.
- Control del ciclo de vida de la BD (setup y teardown de datos en base de pruebas).

Para ejecutar la suite de pruebas automatizadas:
```bash
npm run test
```

### 2. Colección de Postman con Tests
En la raíz del proyecto encontrarás el archivo `La_Casona_API.postman_collection.json`. 
Esta colección incluye **scripts de validación integrados** en cada endpoint que verifican automáticamente:
- Códigos de estado esperados para flujos de éxito y error.
- Tiempo de respuesta.
- Tipos de datos correctos y captura de tokens (pasando automáticamente IDs y tokens de sesión entre peticiones).

---

## 🗄️ Modelo de Datos (Relaciones)

```
Role ──< User ──< Employee
                    │
                    └──< EventStaff >── Event ──< EventItem >── Product
                                          │                         │
Client ──< Event                          │                     Catalog >── Provider
Venue  ──< Event                          │
                                          └──< Sale ──< SaleDetail >── Product
                                                │
                                          ServiceExternal
```

---

## 📡 API Reference

**URL Base:** `http://localhost:3000/api`

> 🔒 Los endpoints marcados con **[Auth]** requieren el header:
> `Authorization: Bearer <token>`

---

### 🔑 Autenticación — `/api/auth`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/register` | No | Registrar nuevo usuario |
| `POST` | `/login` | No | Iniciar sesión |
| `POST` | `/refresh-token` | No | Renovar token JWT |
| `GET` | `/profile` | 🔒 Sí | Obtener perfil del usuario autenticado |
| `POST` | `/recover-password` | No | Cambiar contraseña |

#### `POST /api/auth/register`
```json
// Body (validado con Zod)
{
  "name": "Francisco García",
  "email": "francisco@casona.com",
  "password": "mipassword123",
  "role_id": 1
}

// Response 201
{
  "message": "Usuario registrado exitosamente",
  "user": { "user_id": 1, "name": "Francisco García", "email": "...", "role_id": 1, "status": "active" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

#### `POST /api/auth/login`
```json
// Body
{ "email": "francisco@casona.com", "password": "mipassword123" }

// Response 200
{
  "message": "Inicio de sesión exitoso",
  "user": { "user_id": 1, "name": "Francisco García", ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

#### `POST /api/auth/recover-password`
```json
// Body
{ "email": "francisco@casona.com", "newPassword": "nuevaPassword456" }
```

---

### 👥 Clientes — `/api/clients`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/` | No | Crear cliente |
| `GET` | `/` | No | Listar clientes (paginado) |
| `GET` | `/:id` | No | Obtener cliente por ID |
| `PUT` | `/:id` | No | Actualizar cliente |
| `DELETE` | `/:id` | No | Eliminar cliente |

#### Query params para `GET /api/clients`
| Param | Tipo | Descripción |
|---|---|---|
| `page` | number | Página (default: 1) |
| `limit` | number | Registros por página (default: 10) |
| `search` | string | Buscar por nombre, apellido o documento |

#### `POST /api/clients` — Body
```json
{
  "name": "María",
  "last_name": "López",
  "doc_id": "V-12345678",
  "phone": "04141234567",
  "direction": "Calle 5, Casa 10"
}
```

#### Respuesta paginada (GET /)
```json
{
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5,
  "data": [ ... ]
}
```

---

### 👨‍💼 Empleados — `/api/employees`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/` | No | Crear empleado |
| `GET` | `/` | No | Listar empleados (paginado + búsqueda) |
| `GET` | `/:id` | No | Obtener empleado por ID |
| `PUT` | `/:id` | No | Actualizar empleado |
| `DELETE` | `/:id` | No | Eliminar empleado |

#### Query params para `GET /api/employees`
| Param | Tipo | Descripción |
|---|---|---|
| `page` | number | Página (default: 1) |
| `limit` | number | Límite (default: 10) |
| `search` | string | Buscar por nombre o apellido |

#### `POST /api/employees` — Body
```json
{
  "first_name": "Carlos",
  "last_name": "Pérez",
  "phone": "04121234567",
  "email": "carlos@casona.com",
  "rol": "Bartender",
  "status": "active"
}
```

---

### 🎉 Eventos — `/api/events`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/` | No | Crear evento |
| `GET` | `/` | No | Listar eventos (paginado + filtros) |
| `GET` | `/:id` | No | Obtener evento con cliente y salón |
| `PUT` | `/:id` | No | Actualizar evento |
| `DELETE` | `/:id` | No | Eliminar evento |

#### Query params para `GET /api/events`
| Param | Tipo | Descripción |
|---|---|---|
| `page` | number | Página |
| `limit` | number | Límite |
| `search` | string | Buscar por nombre de evento |
| `status` | string | Filtrar: `Confirmed`, `Pending`, `On Hold`, `Cancelled` |

#### `POST /api/events` — Body
```json
{
  "client_id": 1,
  "venue_id": 2,
  "start_date": "2026-06-15T18:00:00",
  "end_date": "2026-06-16T02:00:00",
  "type_event": "Boda",
  "status": "Confirmed"
}
```

---

### 📦 Ítems de Evento — `/api/event-items`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/` | No | Agregar ítem a un evento |
| `GET` | `/` | No | Listar todos los ítems |
| `GET` | `/:id` | No | Obtener ítem por ID |
| `GET` | `/event/:eventId` | No | Listar ítems de un evento específico |
| `PUT` | `/:id` | No | Actualizar ítem |
| `DELETE` | `/:id` | No | Eliminar ítem |

---

### 👷 Staff de Eventos — `/api/event-staff`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/` | No | Asignar empleado a evento |
| `GET` | `/` | No | Listar todas las asignaciones |
| `GET` | `/:id` | No | Obtener asignación por ID |
| `GET` | `/event/:eventId` | No | Ver staff de un evento específico |
| `PUT` | `/:id` | No | Actualizar asignación |
| `DELETE` | `/:id` | No | Eliminar asignación |

---

### 🍺 Inventario de Bar — `/api/inventory`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/` | No | Registrar movimiento de inventario |
| `GET` | `/` | No | Listar movimientos (paginado + filtros) |
| `GET` | `/:id` | No | Obtener movimiento por ID |
| `PUT` | `/:id` | No | Actualizar movimiento |
| `DELETE` | `/:id` | No | Eliminar movimiento |

#### Query params para `GET /api/inventory`
| Param | Tipo | Descripción |
|---|---|---|
| `page` | number | Página |
| `limit` | number | Límite |
| `movement_type` | string | Filtrar: `Entry`, `Exit`, `Adjustment` |

#### `POST /api/inventory` — Body
```json
{
  "product_id": 3,
  "user_id": 1,
  "movement_type": "Entry",
  "quantity": 24,
  "unit_price": 5.50
}
```

---

### 🛍️ Productos — `/api/products`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/` | No | Crear producto |
| `GET` | `/` | No | Listar productos (paginado + búsqueda + filtros) |
| `GET` | `/:id` | No | Obtener producto por ID |
| `PUT` | `/:id` | No | Actualizar producto |
| `DELETE` | `/:id` | No | Eliminar producto |

#### Query params para `GET /api/products`
| Param | Tipo | Descripción |
|---|---|---|
| `page` | number | Página (default: 1) |
| `limit` | number | Límite (default: 10) |
| `search` | string | Buscar por nombre |
| `category` | string | Filtrar por categoría |

#### `POST /api/products` — Body
```json
{
  "name": "Ron Añejo",
  "category": "Licores",
  "measurement_unit": "Botella",
  "expiry_date": "2027-12-31"
}
```

---

### 💰 Ventas — `/api/sales`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/` | No | Crear venta |
| `GET` | `/` | No | Listar ventas (paginado) |
| `GET` | `/:id` | No | Obtener venta con detalle de ítems |
| `PUT` | `/:id` | No | Actualizar venta |
| `DELETE` | `/:id` | No | Eliminar venta |

#### Query params para `GET /api/sales`
| Param | Tipo | Descripción |
|---|---|---|
| `page` | number | Página |
| `limit` | number | Límite |
| `event_id` | number | Filtrar por evento |

---

### 🏛️ Salones — `/api/venues`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/` | No | Crear salón |
| `GET` | `/` | No | Listar salones (paginado + búsqueda) |
| `GET` | `/:id` | No | Obtener salón por ID |
| `PUT` | `/:id` | No | Actualizar salón |
| `DELETE` | `/:id` | No | Eliminar salón |

#### `POST /api/venues` — Body
```json
{
  "name": "Salón Principal",
  "capacity": 200,
  "status": "Available"
}
```
> Valores posibles para `status`: `Available`, `Occupied`, `Maintenance`, `Reserved`

---

### 🔧 Servicios Externos — `/api/service-external`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/` | No | Registrar servicio externo |
| `GET` | `/` | No | Listar servicios |
| `GET` | `/:id` | No | Obtener servicio por ID |
| `GET` | `/event/:eventId` | No | Servicios de un evento |
| `PUT` | `/:id` | No | Actualizar servicio |
| `DELETE` | `/:id` | No | Eliminar servicio |

---

### 👤 Usuarios — `/api/users`

> 🔒 **Todas las rutas requieren autenticación JWT**

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/` | 🔒 Sí | Listar todos los usuarios (sin contraseñas) |
| `PUT` | `/:id` | 🔒 Sí | Actualizar datos del usuario (no password) |
| `DELETE` | `/:id` | 🔒 Sí | Eliminar usuario |

---

### 📊 Dashboard — `/api/dashboard`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/summary` | No | Resumen general del negocio |

#### Response `GET /api/dashboard/summary`
```json
{
  "eventsConfirmedThisMonth": 8,
  "totalSalesThisWeek": 1250.00,
  "activeClients": 34,
  "upcomingEvents": [ ... ],
  "lowStockProducts": [ ... ]
}
```

---

## ⚠️ Manejo de Errores

Todos los errores son capturados por el middleware global y retornan una estructura consistente:

**En desarrollo (`NODE_ENV=development`):**
```json
{
  "status": "fail",
  "message": "El correo ya está registrado",
  "error": { ... },
  "stack": "Error: ..."
}
```

**En producción (`NODE_ENV=production`):**
```json
{
  "status": "fail",
  "message": "El correo ya está registrado"
}
```

#### Códigos de estado comunes

| Código | Significado |
|---|---|
| `200` | OK |
| `201` | Recurso creado exitosamente |
| `400` | Datos inválidos / error de validación |
| `401` | No autenticado (token ausente o inválido) |
| `403` | No autorizado (sin permisos suficientes) |
| `404` | Recurso no encontrado |
| `409` | Conflicto (ej. email o doc_id duplicado) |
| `429` | Demasiadas peticiones (Rate Limit) |
| `500` | Error interno del servidor |

---

## 🧩 Middlewares

### `verifyToken`
Verifica el JWT en el header `Authorization`. Si es válido, inyecta el usuario en `req.user`.
```js
const { verifyToken } = require('./middleware/authMiddleware');
router.get('/ruta-protegida', verifyToken, controller.handler);
```

### `requireRoles(...roles)`
Verifica que el usuario autenticado tenga uno de los roles indicados.
```js
const { verifyToken, requireRoles } = require('./middleware/authMiddleware');
router.delete('/:id', verifyToken, requireRoles('admin'), controller.delete);
```

### `validateSchema(schema)`
Valida `req.body` contra un esquema de Zod antes de pasar al controlador.
```js
const validateSchema = require('./middleware/validateSchema');
const { createClientSchema } = require('./schemas/client.schema');
router.post('/', validateSchema(createClientSchema), controller.create);
```

### `catchAsync(fn)`
Wrapper que elimina la necesidad de `try/catch` en los controladores.
```js
const catchAsync = require('./utils/catchAsync');
exports.getAll = catchAsync(async (req, res) => {
  const data = await myService.getAll();
  res.json(data);
});
```

### `AppError(message, statusCode)`
Clase para lanzar errores HTTP controlados desde cualquier capa.
```js
const AppError = require('./utils/AppError');
throw new AppError('Recurso no encontrado', 404);
```
