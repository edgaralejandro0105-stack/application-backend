# Changelog Fase 6 - Automatización de Reportes con Cron Jobs

## Objetivo
Implementar tareas automatizadas en segundo plano (Cron Jobs) que consulten la base de datos de forma proactiva y envíen notificaciones clave al administrador sin intervención humana.

## Cambios Realizados

### 1. Instalación de Dependencias
- Se instaló la librería `node-cron` (`npm install node-cron`), un planificador de tareas puro para Node.js basado en la sintaxis tradicional de Cron.

### 2. Modificación de Modelos y Esquemas
Para poder hacer cálculos de inventario y alertas tempranas:
- **`src/models/Product.model.js`**: Se añadieron los campos `current_stock` (Stock Actual) y `min_stock` (Stock Mínimo) como enteros con valor por defecto de 0.
- **`src/schemas/product.schema.js`**: Se actualizó Zod para validar opcionalmente la entrada de estos dos nuevos campos, permitiendo mantener la robustez del API REST.

### 3. Servicio Cron (`src/services/cron.service.js`)
Se creó un nuevo servicio aislado con responsabilidad única de planificar tareas recurrentes:
- **Sintaxis de Tiempo**: Se usó `'0 8 * * 1'`, lo que indica que la tarea se ejecutará a las `0` minutos, `8` horas (8:00 AM), cualquier día del mes (`*`), cualquier mes (`*`), en el día 1 de la semana (`1` = Lunes).
- **Extracción de Datos de Ventas**: Utiliza `Date` y aritmética para calcular exactamente desde las 00:00 del lunes pasado hasta las 23:59 del domingo pasado. Hace una consulta con `Op.between` a la tabla `Sale` y suma el campo `total`.
- **Extracción de Inventario**: Consulta directamente a `Product` usando un comparador (`Op.lte`) para encontrar productos cuyo `current_stock` es menor o igual a su `min_stock`.

### 4. Plantilla de Handlebars (`src/templates/weekly-report.hbs`)
- Se creó una nueva vista responsiva que renderiza el total de ventas.
- Utiliza estructuras de control de Handlebars (`{{#if}}` y `{{#each}}`) para iterar y generar una tabla HTML dinámica solo si hay productos en alerta.

### 5. Enganche en el Ciclo de Vida (`src/server.js`)
- Para garantizar que el cron job comience a correr de inmediato y que se pause/elimine cuando el proceso muera, se inicializó invocando `cronService.init()` en el callback de `app.listen`. Esto asegura que las tareas programadas solo empiecen si el servidor y la conexión a base de datos levantaron correctamente.

---

## Archivos Modificados
- `package.json` (Dependencia `node-cron` y `moment`)
- `src/models/Product.model.js` (Columnas `current_stock`, `min_stock`)
- `src/schemas/product.schema.js` (Validaciones Zod actualizadas)
- `src/server.js` (Iniciador de servicio `cronService.init()`)
- `src/services/cron.service.js` (NUEVO - Lógica de tareas programadas)
- `src/templates/weekly-report.hbs` (NUEVO - Vista de reporte)
- `test_weekly_report.js` (NUEVO - Script de forzado de pruebas)

## Guía de Pruebas
Debido a que el cron job está programado para los Lunes a las 8:00 AM, construimos un script para forzar la prueba de inmediato.

1. Abre tu terminal.
2. Ejecuta el script de forzado (sin necesidad de prender el servidor):
```bash
node test_weekly_report.js
```
3. El script se conectará a PostgreSQL, extraerá las ventas y productos bajos en stock, y enviará el correo.
4. Abre la bandeja de entrada del correo especificado en `.env`. Recibirás el reporte semanal formateado en Handlebars.
