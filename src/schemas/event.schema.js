const { z } = require('zod');

const createEventSchema = z.object({
  client_id: z.number({ required_error: "El ID de cliente es obligatorio" }).int(),
  venue_id: z.number({ required_error: "El ID del salón es obligatorio" }).int(),
  start_date: z.string({ required_error: "La fecha de inicio es obligatoria" }),
  end_date: z.string({ required_error: "La fecha de fin es obligatoria" }),
  type_event: z.string({ required_error: "El tipo de evento es obligatorio" }).max(20),
  status: z.enum(['Confirmed', 'Pending', 'On Hold', 'Cancelled']).optional()
});

module.exports = { createEventSchema };