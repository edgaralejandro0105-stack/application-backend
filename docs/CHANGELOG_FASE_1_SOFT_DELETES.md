# Changelog Fase 1 - Soft Deletes (Borrado Lógico)

## Objetivo
Implementar borrado lógico en los modelos principales de la base de datos para evitar la pérdida de historial. Cuando se elimina un registro, en lugar de borrarlo físicamente, se actualizará un campo `deleted_at` para indicar que ha sido "eliminado", y Sequelize lo ignorará en las consultas estándar.

## Archivos Modificados

### Modelos (`src/models/`)
Se modificaron los siguientes modelos para habilitar la opción `paranoid: true` que provee Sequelize:
- `src/models/Client.model.js`
- `src/models/Employee.model.js`
- `src/models/Product.model.js`
- `src/models/Sale.model.js`
- `src/models/Venue.model.js`

**Líneas agregadas en cada modelo:**
```javascript
  timestamps: true, // Si estaba en false, se habilitó (paranoid requiere timestamps)
  createdAt: '...',
  updatedAt: '...',
  paranoid: true,
  deletedAt: 'deleted_at'
```
**Propósito exacto:**
- `timestamps: true`: Necesario habilitarlo en los modelos donde estaba apagado (`Sale`, `Venue`) ya que `paranoid` requiere que Sequelize mantenga el control de fechas.
- `paranoid: true`: Instruye a Sequelize que el método `.destroy()` ejecutará un "Soft Delete" (actualizar una fecha en vez de ejecutar un DELETE SQL) y que en consultas de tipo `findAll()` y `findOne()` ignore automáticamente los registros marcados como eliminados.
- `deletedAt: 'deleted_at'`: Define el nombre exacto de la columna en base de datos para guardar la fecha de eliminación de acuerdo con la convención snake_case.

### Servicios (`src/services/`)
Se modificaron los métodos `getAll...` de los siguientes servicios para añadir la opción de listar los registros "eliminados" al recibir el query param `includeDeleted=true`:
- `src/services/client.service.js`
- `src/services/employee.service.js`
- `src/services/product.service.js`
- `src/services/sale.service.js`
- `src/services/venue.service.js`

**Líneas modificadas en los servicios:**
Se cambió el llamado estático de `findAndCountAll(...)` por un objeto `options` dinámico.
Ejemplo:
```javascript
    const options = { where, limit, offset, order: [['...']] };
    if (query.includeDeleted === 'true') {
      options.paranoid = false;
    }
    const result = await Model.findAndCountAll(options);
```
**Propósito exacto:**
- Asegurar que las consultas de listado normales solo devuelvan registros "activos" (comportamiento por defecto de `paranoid: true`), pero permitiendo que el cliente API pueda enviar `?includeDeleted=true` en la URL de GET. Al pasar `paranoid: false`, Sequelize omite el filtro automático de `deleted_at IS NULL` y lista absolutamente todo (activos + eliminados).

### Controladores y Rutas de DELETE
No requirieron modificaciones y confirmamos que su comportamiento será de borrado lógico. 

**Confirmación:**
- En todos los casos (`clientController.js`, `venueController.js`, etc.), el controlador invoca la función de eliminación de su servicio correspondiente (ej: `await clientService.deleteClient(id)`).
- El servicio ubica el registro y ejecuta el método `await model.destroy()`.
- Gracias a la configuración `paranoid: true` de los modelos, Sequelize traduce automáticamente ese `destroy()` a un borrado lógico (e.g. `UPDATE clients SET deleted_at = NOW() WHERE id = X`), protegiendo el historial en la base de datos sin necesitar tocar el código en capas superiores a la del modelo.
