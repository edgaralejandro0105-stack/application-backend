const { z } = require('zod');

const createInventoryItemSchema = z.object({
  product_id: z.number({ required_error: 'El ID del producto es requerido' }).int(),
  quantity: z.number({ required_error: 'La cantidad es requerida' }).int(),
  movement_type: z.enum(['Sale', 'Purchase', 'Adjustment'], { required_error: 'El tipo de movimiento es requerido' }),
  notes: z.string().optional()
});

module.exports = { createInventoryItemSchema };