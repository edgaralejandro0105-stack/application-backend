const { z } = require('zod');

const createEventSchema = z.object({
  client_id: z.number({ required_error: "El ID de cliente es obligatorio" }).int(),
  venue_id: z.number({ required_error: "El ID del salón es obligatorio" }).int(),
  start_date: z.string({ required_error: "La fecha de inicio es obligatoria" }),
  end_date: z.string({ required_error: "La fecha de fin es obligatoria" }),
  type_event: z.string({ required_error: "El tipo de evento es obligatorio" }).max(20),
  status: z.enum(['Confirmed', 'Pending', 'On Hold', 'Cancelled']).optional()
});

const createWebsiteReservationSchema = z.object({
  salon: z.string({ required_error: "El salón es obligatorio" }),
  horario: z.string({ required_error: "El horario es obligatorio" }),
  fecha: z.string({ required_error: "La fecha es obligatoria" }),
  tipo: z.string({ required_error: "El tipo de evento es obligatorio" }),
  descripcion: z.string().optional(),
  servicios: z.any().optional(),
  personal: z.any().optional(),
  contacto: z.object({
    nombre: z.string({ required_error: "El nombre es obligatorio" }),
    telefono: z.string({ required_error: "El teléfono es obligatorio" }),
    correo: z.string().email("Correo inválido").optional().or(z.literal(''))
  })
});

module.exports = { createEventSchema, createWebsiteReservationSchema };