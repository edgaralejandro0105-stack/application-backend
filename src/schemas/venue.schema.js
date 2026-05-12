const { z } = require('zod');

const createVenueSchema = z.object({
  name: z.string({ required_error: 'El nombre del salón es requerido' }).max(100),
  capacity: z.number({ required_error: 'La capacidad del salón es requerida' }).int().positive(),
  address: z.string().max(200).optional(),
  price_per_day: z.number().nonnegative().optional()
});

module.exports = { createVenueSchema };