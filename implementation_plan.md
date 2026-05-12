# Plan de Implementación: Auditoría y Mejora del Backend "La Casona"

Este documento presenta los resultados de la auditoría y el plan de acción para llevar el código a un estándar de Arquitectura Limpia (Clean Architecture), mejorar la seguridad, integridad y rendimiento.

## 1. Auditoría y Reporte de Brechas (Gap Report)

Tras analizar el estado actual del código, aquí están los resultados respecto al checklist solicitado:

*   **Arquitectura Limpia:** ⚠️ **A medias / Faltante.** Tienes la estructura de carpetas (`routes`, `controllers`, `services`, `models`), pero la carpeta `services/` está vacía. Toda la lógica de negocio y el acceso a la base de datos están fuertemente acoplados dentro de los controladores.
*   **Autenticación y Autorización (RBAC):** ⚠️ **A medias.** Tienes `JWT` implementado en `authMiddleware.js`. Sin embargo, el RBAC es muy rígido (`accessLevel < 3` hardcodeado en `requireAdmin`) en lugar de basarse en un sistema robusto de permisos o roles configurables dinámicamente.
*   **Seguridad de la API:** ⚠️ **A medias.** Tienes `helmet` y `cors`. Sin embargo, `cors()` está abierto para cualquier origen en lugar de estar restringido a tu frontend (Vite). **Falta** `express-rate-limit` para mitigar ataques de fuerza bruta o DDoS.
*   **Integridad Relacional:** ❌ **Faltante.** Faltan los modelos explícitos de `Catalogo` (`Catalog`) y `Proveedor` (`Provider`). Las relaciones (associations) de Sequelize están dispersas en los archivos de los modelos y no hay un punto centralizado para manejarlas, lo que puede causar problemas de dependencias circulares. No se observan **transacciones SQL** (`sequelize.transaction`) para operaciones complejas.
*   **Validación y Errores:** ⚠️ **A medias.** Tienes `errorHandler.js` y archivos en `schemas/` (Zod), pero el middleware `validateBody.js` que actualmente se usa es rudimentario (solo verifica campos vacíos manualmente) en lugar de utilizar los esquemas Zod creados. Falta una clase global de Errores (`AppError`) para diferenciar entre errores operacionales y bugs.
*   **Utilidades:** ❌ **Faltante.** No hay soporte estandarizado para paginación, filtros o búsquedas en las listas. Falta un wrapper `catchAsync` para eliminar los bloques `try/catch` redundantes de cada controlador.

---

> [!IMPORTANT]
> **Revisión del Usuario Requerida**
> Antes de proceder, confirma si estás de acuerdo con:
> 1. Restringir `CORS` a una URL específica (ej. `http://localhost:5173` para Vite). Si ya tienes la URL de producción, indícamela.
> 2. Mover toda la lógica de los Controladores a los Servicios (Clean Architecture).
> 3. Crear los modelos de `Provider` y `Catalog` con sus respectivas relaciones (Un Proveedor tiene muchos Catálogos, un Catálogo pertenece a un Producto y Proveedor).
> 4. ¿Deseas que implemente la refactorización a Clean Architecture (separar Controladores y Servicios) para TODOS los endpoints, o prefieres que lo aplique solo a los más críticos (Auth, Products, Inventory, Catalogs)?

## 2. Cambios Propuestos

Los cambios se agrupan por capa o área del sistema.

### Capa de Utilidades y Errores

Implementaremos herramientas para simplificar el código.

#### [NEW] `src/utils/AppError.js`
Clase de error personalizada para manejar códigos HTTP y errores operacionales.
#### [NEW] `src/utils/catchAsync.js`
Wrapper para controladores que elimina la necesidad de escribir `try/catch` en cada función, enviando los errores automáticamente al manejador global.
#### [MODIFY] `src/middleware/errorHandler.js`
Refactorizar para atrapar instancias de `AppError`, errores de validación Zod y errores de Sequelize, respondiendo un JSON estructurado.

---

### Capa de Base de Datos y Modelos (Integridad Relacional)

Se agregarán los modelos faltantes y se centralizarán las relaciones.

#### [NEW] `src/models/Provider.model.js`
Modelo de Proveedores.
#### [NEW] `src/models/Catalog.model.js`
Modelo de Catálogo (Tabla intermedia enriquecida o entidad que relaciona un Proveedor, un Producto y el Precio del proveedor).
#### [NEW] `src/models/index.js`
Punto de entrada único que importará todos los modelos y definirá las asociaciones (`hasMany`, `belongsTo`, `belongsToMany`).
#### [MODIFY] `src/server.js` y `src/config/db.js`
Actualizar para utilizar `src/models/index.js` y evitar que `server.js` importe cada modelo individualmente.

---

### Capa de Middleware y Seguridad

#### [NEW] `src/middleware/validateZod.js`
Middleware que reciba un esquema de Zod (desde `src/schemas/`) y valide `req.body`, `req.query` o `req.params`.
#### [MODIFY] `src/middleware/authMiddleware.js`
Mejorar el RBAC para aceptar un array de roles permitidos en la ruta (ej. `requireRoles(['admin', 'manager'])`).
#### [MODIFY] `src/server.js`
Instalar y configurar `express-rate-limit` y restringir las opciones de `CORS`.

---

### Capa de Arquitectura Limpia (Controladores y Servicios)

Como prueba de concepto y refactorización principal, moveremos la lógica al patrón `Service` y usaremos utilidades.

#### [NEW] `src/services/product.service.js`
Lógica de creación, lectura, actualización y eliminación de productos. Implementará **Paginación, Filtros y Búsqueda**.
#### [MODIFY] `src/controllers/productController.js`
Refactorizar utilizando `catchAsync`, delegando la lógica a `product.service.js` y dejando el controlador solo responsable de la respuesta HTTP.
#### [NEW] `src/services/auth.service.js`
Lógica de inicio de sesión y validación de usuarios.
#### [MODIFY] `src/controllers/authController.js`
Refactorizar utilizando `catchAsync` y `auth.service.js`.

*(Nota: En la fase de ejecución, aplicaremos este patrón a todos los controladores principales para optimizar la base del código)*.

## 3. Plan de Verificación

### Pruebas Automatizadas
Se validarán los siguientes aspectos tras los cambios:
- Se reiniciará la base de datos (con `sequelize.sync({ alter: true })` en entorno de dev) para comprobar que `Catalog` y `Provider` se crean correctamente con sus claves foráneas.
- Se verificará que el middleware global de errores (`errorHandler`) intercepta correctamente los errores de validación de `Zod`.
- Se probará el rate limiting.

### Revisión Manual
- Se revisará el código resultante de los controladores para garantizar la limpieza (`catchAsync` sin `try/catch` anidados).
- Se requerirá la validación por parte del usuario de la integración de Vite frente al nuevo control de CORS estricto.
