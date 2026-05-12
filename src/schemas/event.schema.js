const { z } = require('zod');

const createEventSchema = z.object({
  // Asumiendo los campos de tu modelo Event
  client_id: z.number({ required_error: "El ID de cliente es obligatorio" }).int(),
  venue_id: z.number({ required_error: "El ID del salón es obligatorio" }).int(),
  date: z.string({ required_error: "La fecha es obligatoria" }),
  // Agrega otros campos como guests, status, etc. según los tengas en tu BD
});

module.exports = { createEventSchema };