const { z } = require('zod');

const createEmployeeSchema = z.object({
  first_name: z.string({ required_error: 'El nombre es requerido' }).max(50),
  last_name: z.string({ required_error: 'El apellido es requerido' }).max(50),
  phone: z.string().max(15, 'El teléfono es muy largo').optional(),
  email: z.string().email('Formato de email inválido').optional(),
  rol: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional()
});

module.exports = { createEmployeeSchema };