const { z } = require('zod');

const createVenueSchema = z.object({
  name: z.string({ required_error: 'El nombre del salón es requerido' }).max(50, 'El nombre no puede exceder 50 caracteres'),
  capacity: z.coerce.number({ required_error: 'La capacidad del salón es requerida' }).int().positive('La capacidad debe ser mayor a 0'),
  status: z.enum(['Available', 'Occupied', 'Maintenance', 'Reserved']).optional()
});

module.exports = { createVenueSchema };