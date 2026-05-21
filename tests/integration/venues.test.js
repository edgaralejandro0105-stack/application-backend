const request = require('supertest');
const app = require('../../src/server');
const { sequelize, Venue } = require('../../src/models');
const { z } = require('zod');

const venueResponseSchema = z.object({
  venue_id: z.number(),
  name: z.string(),
  capacity: z.number(),
  status: z.enum(['Available', 'Occupied', 'Maintenance', 'Reserved']),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().nullable().optional()
});

let testVenueId;
const uniqueSuffix = Date.now();
const testVenueName = `Salón Test ${uniqueSuffix}`;

beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  if (testVenueId) {
    await Venue.destroy({ where: { venue_id: testVenueId }, force: true });
  }
  await sequelize.close();
});

describe('Pruebas de Integración - Salones (/api/venues)', () => {

  it('POST /api/venues - Debe crear un nuevo salón con datos válidos', async () => {
    const response = await request(app)
      .post('/api/venues')
      .send({
        name: testVenueName,
        capacity: 150,
        status: 'Available'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');

    const validatedData = venueResponseSchema.parse(response.body.data);
    expect(validatedData.name).toBe(testVenueName);
    expect(validatedData.capacity).toBe(150);
    testVenueId = validatedData.venue_id;
  });

  it('POST /api/venues - Debe fallar si faltan campos obligatorios o son incorrectos', async () => {
    const response = await request(app)
      .post('/api/venues')
      .send({
        name: 'Salón Invalido',
        capacity: -10 // capacidad inválida (debe ser positiva)
      });

    expect(response.status).toBe(400); // ZodError
  });

  it('GET /api/venues - Debe listar salones con paginación', async () => {
    const response = await request(app)
      .get('/api/venues')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);

    const paginatedSchema = z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
      data: z.array(venueResponseSchema.passthrough())
    });

    const validatedBody = paginatedSchema.parse(response.body);
    const found = validatedBody.data.find(v => v.venue_id === testVenueId);
    expect(found).toBeDefined();
  });

  it('GET /api/venues/:id - Debe obtener un salón por ID', async () => {
    const response = await request(app)
      .get(`/api/venues/${testVenueId}`);

    expect(response.status).toBe(200);
    const validatedData = venueResponseSchema.parse(response.body);
    expect(validatedData.venue_id).toBe(testVenueId);
  });

  it('PUT /api/venues/:id - Debe actualizar los datos del salón', async () => {
    const response = await request(app)
      .put(`/api/venues/${testVenueId}`)
      .send({
        name: `${testVenueName} Modificado`,
        capacity: 250,
        status: 'Reserved'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');

    const validatedData = venueResponseSchema.parse(response.body.data);
    expect(validatedData.name).toBe(`${testVenueName} Modificado`);
    expect(validatedData.capacity).toBe(250);
    expect(validatedData.status).toBe('Reserved');
  });

  it('DELETE /api/venues/:id - Debe realizar una eliminación lógica del salón', async () => {
    const deleteResponse = await request(app)
      .delete(`/api/venues/${testVenueId}`);

    expect(deleteResponse.status).toBe(200);

    const getResponse = await request(app)
      .get(`/api/venues/${testVenueId}`);
    
    expect(getResponse.status).toBe(404);
  });
});
