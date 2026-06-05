const { createWebsiteReservationSchema } = require('./src/schemas/event.schema.js');

try {
  const formData = {
    salon: 'Ambos',
    horario: '20:00-03:00',
    fecha: '2026-10-15',
    tipo: 'Bodas',
    descripcion: '',
    servicios: {},
    personal: {
      'Mesoneros': 0,
      'Barman': 0,
      'Seguridad': 0
    },
    contacto: {
      nombre: 'Test User',
      telefono: '123456789',
      correo: 'test@example.com'
    }
  };

  createWebsiteReservationSchema.parse(formData);
  console.log("Zod Validation Passed");
} catch (e) {
  console.log("Zod Validation Failed:", e.errors || e.message);
}
