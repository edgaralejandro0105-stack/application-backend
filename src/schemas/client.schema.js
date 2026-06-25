const { z } = require('zod');

const createClientSchema = z.object({
  name: z.string({ required_error: 'El nombre es requerido' }).max(50, 'El nombre no puede exceder los 50 caracteres'),
  last_name: z.string({ required_error: 'El apellido es requerido' }).max(50, 'El apellido no puede exceder los 50 caracteres'),
  doc_id: z.string({ required_error: 'El documento de identidad es requerido' }),
  phone: z.string().max(20, 'El teléfono no puede exceder 20 caracteres').optional(),
  direction: z.string().max(80, 'La dirección no puede exceder 80 caracteres').optional()
});

module.exports = { createClientSchema };