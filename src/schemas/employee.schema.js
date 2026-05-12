const { z } = require('zod');

const createEmployeeSchema = z.object({
  name: z.string({ required_error: 'El nombre es requerido' }).max(50),
  last_name: z.string({ required_error: 'El apellido es requerido' }).max(50),
  doc_id: z.string({ required_error: 'El documento de identidad es requerido' }),
  phone: z.string().max(15, 'El teléfono es muy largo').optional(),
  position: z.string().optional() // Ej: Mesero, Seguridad, Coordinador
});

module.exports = { createEmployeeSchema };