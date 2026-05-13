const { z } = require('zod');

const createSaleSchema = z.object({
  event_id: z.number({ required_error: 'El ID del evento es requerido' }).int(),
  employee_id: z.number().int().optional(),
  total: z.number({ required_error: 'El total de la venta es requerido' }).nonnegative('El total no puede ser negativo')
});

module.exports = { createSaleSchema };