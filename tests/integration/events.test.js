const request = require('supertest');
const app = require('../../src/server');
const { 
  sequelize, 
  Event, 
  Client, 
  Venue, 
  Employee, 
  Product, 
  EventItem, 
  EventStaff, 
  ServiceExternal,
  Role
} = require('../../src/models');
const { z } = require('zod');

// Esquemas de validación de respuestas
const eventResponseSchema = z.object({
  event_id: z.number(),
  client_id: z.number(),
  venue_id: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  type_event: z.string(),
  status: z.enum(['Confirmed', 'Pending', 'On Hold', 'Cancelled'])
});

const eventItemResponseSchema = z.object({
  item_id: z.number(),
  event_id: z.number().nullable().optional(),
  service_id: z.number().nullable().optional(),
  final_price: z.union([z.string(), z.number()]).nullable().optional()
});

const eventStaffResponseSchema = z.object({
  assignment_id: z.number(),
  event_id: z.number().nullable().optional(),
  employee_id: z.number().nullable().optional(),
  notes: z.string().nullable().optional()
});

const serviceExternalResponseSchema = z.object({
  service_id: z.number(),
  service_type: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  base_price: z.union([z.string(), z.number()]).nullable().optional(),
  provider_info: z.string().nullable().optional()
});

let testClientId;
let testVenueId;
let testEmployeeId;
let testProductId;

let testEventId;
let testEventItemId;
let testEventStaffId;
let testServiceExternalId;

const uniqueSuffix = Date.now();

beforeAll(async () => {
  await sequelize.authenticate();

  // Crear registros base necesarios para las llaves foráneas
  const client = await Client.create({
    name: 'Cliente Eventos',
    last_name: 'Prueba',
    doc_id: `CLI_EV_${uniqueSuffix}`,
    phone: '123456',
    direction: 'Dirección de prueba'
  });
  testClientId = client.client_id;

  const venue = await Venue.create({
    name: `Salón Eventos ${uniqueSuffix}`,
    capacity: 100,
    status: 'Available'
  });
  testVenueId = venue.venue_id;

  // Garantizar el rol Bartender para el empleado
  await Role.findOrCreate({
    where: { role_name: 'Bartender' },
    defaults: { role_name: 'Bartender', description: 'Bartender' }
  });

  const employee = await Employee.create({
    first_name: 'Empleado Evento',
    last_name: 'Prueba',
    phone: '123456',
    email: `emp_ev_${uniqueSuffix}@example.com`,
    rol: 'Bartender',
    status: 'active'
  });
  testEmployeeId = employee.employee_id;

  const product = await Product.create({
    name: `Refresco Ev ${uniqueSuffix}`,
    category: 'Bebidas',
    measurement_unit: 'Lata',
    expiry_date: '2028-01-01',
    current_stock: 100,
    min_stock: 10
  });
  testProductId = product.product_id;

  const serviceExt = await ServiceExternal.create({
    name: `Service Ev ${uniqueSuffix}`,
    service_type: 'Test Service',
    base_price: 150.00
  });
  testServiceExternalId = serviceExt.service_id;
});

afterAll(async () => {
  if (testEventStaffId) {
    await EventStaff.destroy({ where: { assignment_id: testEventStaffId } });
  }
  if (testEventItemId) {
    await EventItem.destroy({ where: { item_id: testEventItemId } });
  }
  if (testServiceExternalId) {
    await ServiceExternal.destroy({ where: { service_id: testServiceExternalId } });
  }
  if (testEventId) {
    await Event.destroy({ where: { event_id: testEventId } });
  }
  if (testProductId) {
    await Product.destroy({ where: { product_id: testProductId }, force: true });
  }
  if (testEmployeeId) {
    await Employee.destroy({ where: { employee_id: testEmployeeId }, force: true });
  }
  if (testVenueId) {
    await Venue.destroy({ where: { venue_id: testVenueId }, force: true });
  }
  if (testClientId) {
    await Client.destroy({ where: { client_id: testClientId } });
  }
  await sequelize.close();
});

describe('Pruebas de Integración - Eventos y sub-recursos', () => {

  describe('Gestión de Eventos (/api/events)', () => {
    it('POST /api/events - Debe crear un nuevo evento', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          client_id: testClientId,
          venue_id: testVenueId,
          start_date: '2026-10-15T18:00:00.000Z',
          end_date: '2026-10-16T02:00:00.000Z',
          type_event: 'Boda',
          status: 'Pending'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');

      const validatedData = eventResponseSchema.parse(response.body.data);
      expect(validatedData.client_id).toBe(testClientId);
      expect(validatedData.venue_id).toBe(testVenueId);
      testEventId = validatedData.event_id;
    });

    it('GET /api/events - Debe listar eventos', async () => {
      const response = await request(app)
        .get('/api/events')
        .query({ page: 1, limit: 100 });

      expect(response.status).toBe(200);

      const paginatedSchema = z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
        data: z.array(eventResponseSchema.passthrough())
      });

      const validatedBody = paginatedSchema.parse(response.body);
      const found = validatedBody.data.find(e => e.event_id === testEventId);
      expect(found).toBeDefined();
    });

    it('GET /api/events/:id - Debe obtener el evento por ID con detalles de cliente y salón', async () => {
      const response = await request(app)
        .get(`/api/events/${testEventId}`);

      expect(response.status).toBe(200);
      
      const detailedEventSchema = eventResponseSchema.extend({
        Client: z.object({ name: z.string(), last_name: z.string() }).passthrough(),
        Venue: z.object({ name: z.string() }).passthrough()
      });

      detailedEventSchema.parse(response.body);
    });

    it('PUT /api/events/:id - Debe modificar datos del evento', async () => {
      const response = await request(app)
        .put(`/api/events/${testEventId}`)
        .send({
          client_id: testClientId,
          venue_id: testVenueId,
          start_date: '2026-10-15T18:00:00.000Z',
          end_date: '2026-10-16T04:00:00.000Z', // Extendido dos horas
          type_event: 'Boda Modificada',
          status: 'Confirmed'
        });

      expect(response.status).toBe(200);
      const validatedData = eventResponseSchema.parse(response.body.data);
      expect(validatedData.type_event).toBe('Boda Modificada');
      expect(validatedData.status).toBe('Confirmed');
    });
  });

  describe('Ítems de Evento (/api/event-items)', () => {
    it('POST /api/event-items - Debe agregar un ítem planificado al evento', async () => {
      const response = await request(app)
        .post('/api/event-items')
        .send({
          event_id: testEventId,
          service_id: testServiceExternalId,
          final_price: 50.00
        });

      expect(response.status).toBe(201);
      const validatedData = eventItemResponseSchema.parse(response.body.data);
      expect(validatedData.event_id).toBe(testEventId);
      testEventItemId = validatedData.item_id;
    });

    it('GET /api/event-items/event/:eventId - Debe obtener los ítems del evento específico', async () => {
      const response = await request(app)
        .get(`/api/event-items/event/${testEventId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const items = z.array(eventItemResponseSchema.passthrough()).parse(response.body);
      const foundItem = items.find(item => item.item_id === testEventItemId);
      expect(foundItem).toBeDefined();
    });

    it('PUT /api/event-items/:id - Debe modificar la cantidad planificada', async () => {
      const response = await request(app)
        .put(`/api/event-items/${testEventItemId}`)
        .send({
          final_price: 75.00
        });

      expect(response.status).toBe(200);
      const validatedData = eventItemResponseSchema.parse(response.body.data);
    });
  });

  describe('Personal de Eventos (/api/event-staff)', () => {
    it('POST /api/event-staff - Debe asignar personal al evento', async () => {
      const response = await request(app)
        .post('/api/event-staff')
        .send({
          event_id: testEventId,
          employee_id: testEmployeeId,
          notes: 'Bartender Jefe'
        });

      expect(response.status).toBe(201);
      const validatedData = eventStaffResponseSchema.parse(response.body.data);
      expect(validatedData.employee_id).toBe(testEmployeeId);
      testEventStaffId = validatedData.assignment_id;
    });

    it('GET /api/event-staff/event/:eventId - Debe listar el personal del evento', async () => {
      const response = await request(app)
        .get(`/api/event-staff/event/${testEventId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const staffList = z.array(eventStaffResponseSchema.passthrough()).parse(response.body);
      const foundStaff = staffList.find(staff => staff.assignment_id === testEventStaffId);
      expect(foundStaff).toBeDefined();
    });
  });

  describe('Servicios Externos (/api/service-external)', () => {
    it('POST /api/service-external - Debe registrar un servicio externo', async () => {
      const response = await request(app)
        .post('/api/service-external')
        .send({
          name: 'DJ Sonido Pro',
          service_type: 'Sonido e Iluminación',
          base_price: 350.00
        });

      expect(response.status).toBe(201);
      const validatedData = serviceExternalResponseSchema.parse(response.body.data);
      // Creamos un servicio extra, pero el que se ligó al evento es testServiceExternalId
    });

    it('GET /api/service-external/event/:eventId - Debe listar servicios externos por evento', async () => {
      const response = await request(app)
        .get(`/api/service-external/event/${testEventId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const serviceList = z.array(serviceExternalResponseSchema.passthrough()).parse(response.body);
      const foundService = serviceList.find(s => s.service_id === testServiceExternalId);
      expect(foundService).toBeDefined();
    });
  });
});
