# Implementación de Paginación en La Casona

Este documento describe los cambios realizados para implementar y uniformar la paginación a nivel de Backend y Frontend en todo el sistema de La Casona.

## Contexto Inicial
Anteriormente, algunas vistas del frontend (como Inventario, Proveedores y Recursos Humanos) manejaban la paginación de manera puramente visual (filtrando en el lado del cliente), lo que causaba dos problemas:
1. Peticiones muy pesadas al cargar absolutamente todos los registros.
2. Comportamientos extraños donde los menús desplegables (selects de clientes o empleados en "Crear Evento") solo mostraban 10 registros, porque el backend tenía un límite por defecto de 10 que el frontend ignoraba o sobreescribía de forma inconsistente.

## Cambios en el Backend

1. **`provider.service.js`**
   - Se modificó el método `getAll()` para incluir parámetros de paginación (`limit`, `page`, `offset`).
   - Se añadió capacidad de búsqueda (filtro `search`) por nombre, contacto o email mediante `Op.iLike`.
   - El endpoint ahora retorna un objeto de la forma: `{ total, page, limit, totalPages, data }`.

2. **`employee.service.js`**
   - El servicio ya contaba con paginación, pero se añadieron validaciones para filtrar por departamento (`rol`) y estado (`status`) de forma dinámica si llegan por la URL (ej. `?department=Mesero&status=active`).

3. **Optimización de Dropdowns**
   - Los endpoints se mantienen usando paginación estándar. La corrección para los dropdowns consistió en pedir al frontend que especifique un `limit` excepcionalmente alto (ej. `10000`) únicamente cuando se necesiten poblar selectores.

## Cambios en el Frontend

1. **Vistas Refactorizadas para usar Paginación del Backend**:
   - `providers-view.jsx`
   - `inventory-view.jsx`
   - `hr-view.jsx`
   
   En todas estas vistas se añadieron los siguientes estados:
   ```javascript
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [totalItems, setTotalItems] = useState(0);
   ```
   Y se modificaron las llamadas a los servicios para pasar explícitamente `page`, `limit` y los demás filtros (search, categoría, estado).

2. **Corrección de Listados (Dropdowns)**:
   - Se identificaron lugares donde se hacía `clientService.getAll()` o `employeeService.getAll()` sin pasar límite, provocando que solo cargaran los primeros 10.
   - Estos componentes (como `events-view.jsx`, `create-sale.jsx`, y `dashboard-view.jsx`) fueron modificados para realizar llamadas como `getAll({ limit: 10000 })` de forma que los desplegables de selección muestren todos los registros disponibles sin recortes.

## Futuras Mejoras
- Considerar endpoints específicos tipo `/search` o `/lite` que devuelvan solo los campos ID y Nombre si se nota un peso muy alto de red al hacer `{ limit: 10000 }` para los dropdowns.
