const request = require('supertest');
const app = require('../../src/server');
const { 
  sequelize, 
  Sale, 
  Event, 
  Client, 
  Venue, 
  Employee, 
  Role 
} = require('../../src/models');
const { z } = require('zod');

const saleResponseSchema = z.object({
  sale_id: z.number(),
  event_id: z.number(),
  employee_id: z.number().nullable().optional(),
  total: z.union([z.string(), z.number()]),
  create_at: z.string().optional(),
  update_at: z.string().optional(),
  deleted_at: z.string().nullable().optional()
});

let testClientId;
let testVenueId;
let testEmployeeId;
let testEventId;
let testSaleId;

const uniqueSuffix = Date.now();

beforeAll(async () => {
  await sequelize.authenticate();

  // Crear cliente
  const client = await Client.create({
    name: 'Cliente Ventas',
    last_name: 'Prueba',
    doc_id: `CLI_SALE_${uniqueSuffix}`,
    phone: '123456',
    direction: 'Dirección'
  });
  testClientId = client.client_id;

  // Crear venue
  const venue = await Venue.create({
    name: `Salón Venta ${uniqueSuffix}`,
    capacity: 100,
    status: 'Available'
  });
  testVenueId = venue.venue_id;

  // Crear rol y empleado
  await Role.findOrCreate({
    where: { role_name: 'Bartender' },
    defaults: { role_name: 'Bartender', description: 'Bartender' }
  });

  const employee = await Employee.create({
    first_name: 'Bartender Venta',
    last_name: 'Prueba',
    phone: '123456',
    email: `emp_sale_${uniqueSuffix}@example.com`,
    rol: 'Bartender',
    status: 'active'
  });
  testEmployeeId = employee.employee_id;

  // Crear evento
  const event = await Event.create({
    client_id: testClientId,
    venue_id: testVenueId,
    start_date: '2026-12-01T18:00:00.000Z',
    end_date: '2026-12-02T02:00:00.000Z',
    type_event: 'Graduación',
    status: 'Confirmed'
  });
  testEventId = event.event_id;
});

afterAll(async () => {
  if (testSaleId) {
    await Sale.destroy({ where: { sale_id: testSaleId }, force: true });
  }
  if (testEventId) {
    await Event.destroy({ where: { event_id: testEventId } });
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

describe('Pruebas de Integración - Ventas (/api/sales)', () => {

  it('POST /api/sales - Debe crear una venta con datos válidos', async () => {
    const response = await request(app)
      .post('/api/sales')
      .send({
        event_id: testEventId,
        employee_id: testEmployeeId,
        total: 1500.50
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');

    const validatedData = saleResponseSchema.parse(response.body.data);
    expect(validatedData.event_id).toBe(testEventId);
    expect(validatedData.employee_id).toBe(testEmployeeId);
    expect(Number(validatedData.total)).toBe(1500.50);
    testSaleId = validatedData.sale_id;
  });

  it('POST /api/sales - Debe fallar si faltan campos obligatorios o son incorrectos', async () => {
    const response = await request(app)
      .post('/api/sales')
      .send({
        employee_id: testEmployeeId,
        total: -50 // Negativo inválido
      });

    expect(response.status).toBe(400); // ZodError
  });

  it('GET /api/sales - Debe listar ventas con paginación', async () => {
    const response = await request(app)
      .get('/api/sales')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);

    const paginatedSchema = z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
      data: z.array(saleResponseSchema.passthrough())
    });

    const validatedBody = paginatedSchema.parse(response.body);
    const found = validatedBody.data.find(sale => sale.sale_id === testSaleId);
    expect(found).toBeDefined();
  });

  it('GET /api/sales/:id - Debe obtener la venta por ID', async () => {
    const response = await request(app)
      .get(`/api/sales/${testSaleId}`);

    expect(response.status).toBe(200);
    const validatedData = saleResponseSchema.parse(response.body);
    expect(validatedData.sale_id).toBe(testSaleId);
  });

  it('PUT /api/sales/:id - Debe actualizar los datos de la venta', async () => {
    const response = await request(app)
      .put(`/api/sales/${testSaleId}`)
      .send({
        total: 1750.00
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');

    const validatedData = saleResponseSchema.parse(response.body.data);
    expect(Number(validatedData.total)).toBe(1750.00);
  });

  it('DELETE /api/sales/:id - Debe realizar una eliminación lógica de la venta (soft delete)', async () => {
    const deleteResponse = await request(app)
      .delete(`/api/sales/${testSaleId}`);

    expect(deleteResponse.status).toBe(200);

    // Intentar obtenerla de nuevo (debe retornar 404 porque no está en modo paranoid = false)
    const getResponse = await request(app)
      .get(`/api/sales/${testSaleId}`);
    
    expect(getResponse.status).toBe(404);
  });
});
