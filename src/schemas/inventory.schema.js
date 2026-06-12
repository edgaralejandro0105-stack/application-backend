const { z } = require('zod');

const createInventoryItemSchema = z.object({
  product_id: z.coerce.number({ required_error: 'El ID del producto es requerido' }).int(),
  quantity: z.coerce.number({ required_error: 'La cantidad es requerida' }).positive('La cantidad debe ser mayor a 0'),
  movement_type: z.enum(['Entry', 'Exit', 'Adjustment'], { required_error: 'El tipo de movimiento es requerido' }),
  unit_price: z.coerce.number().nonnegative('El precio no puede ser negativo').optional()
});

const updateInventoryItemSchema = createInventoryItemSchema.partial();

module.exports = { createInventoryItemSchema, updateInventoryItemSchema };