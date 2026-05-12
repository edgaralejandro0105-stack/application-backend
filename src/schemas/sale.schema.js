const { z } = require('zod');

const createSaleSchema = z.object({
  client_id: z.number({ required_error: 'El ID del cliente es requerido' }).int(),
  total_price: z.number({ required_error: 'El total de la venta es requerido' }).nonnegative(),
  sale_date: z.string().optional() // Si envías la fecha desde el frontend
});

module.exports = { createSaleSchema };