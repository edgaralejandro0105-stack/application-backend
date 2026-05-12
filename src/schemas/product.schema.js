const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string({ required_error: 'El nombre del producto es requerido' }).max(100, 'El nombre es muy largo'),
  description: z.string().optional(),
  price: z.number({ required_error: 'El precio es requerido' }).positive('El precio debe ser mayor a 0'),
  // stock: z.number().int().nonnegative().optional() // Descomenta si manejas stock aquí
});

module.exports = { createProductSchema };