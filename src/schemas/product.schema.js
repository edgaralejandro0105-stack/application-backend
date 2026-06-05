const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string({ required_error: 'El nombre del producto es requerido' }).max(50, 'El nombre no puede exceder 50 caracteres'),
  category: z.string({ required_error: 'La categoría es requerida' }).max(50, 'La categoría no puede exceder 50 caracteres'),
  measurement_unit: z.string({ required_error: 'La unidad de medida es requerida' }).max(50),
  expiry_date: z.string().optional(),
  current_stock: z.coerce.number().int().min(0).optional(),
  min_stock: z.coerce.number().int().min(0).optional()
});

module.exports = { createProductSchema };