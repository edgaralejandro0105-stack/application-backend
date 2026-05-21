const request = require('supertest');
const app = require('../../src/server');
const { sequelize, Product } = require('../../src/models');
const { z } = require('zod');

const productResponseSchema = z.object({
  product_id: z.number(),
  name: z.string(),
  category: z.string(),
  measurement_unit: z.string(),
  expiry_date: z.string().nullable().optional(),
  current_stock: z.number(),
  min_stock: z.number(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().nullable().optional()
});

let testProductId;
const uniqueSuffix = Date.now();
const testProductName = `Producto Test ${uniqueSuffix}`;

beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  if (testProductId) {
    await Product.destroy({ where: { product_id: testProductId }, force: true });
  }
  await sequelize.close();
});

describe('Pruebas de Integración - Productos (/api/products)', () => {

  it('POST /api/products - Debe crear un nuevo producto con datos válidos', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({
        name: testProductName,
        category: 'Licores',
        measurement_unit: 'Botella',
        expiry_date: '2027-12-31',
        current_stock: 50,
        min_stock: 5
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');

    const validatedData = productResponseSchema.parse(response.body.data);
    expect(validatedData.name).toBe(testProductName);
    expect(validatedData.current_stock).toBe(50);
    testProductId = validatedData.product_id;
  });

  it('POST /api/products - Debe fallar si faltan campos obligatorios', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({
        name: 'Producto Incompleto'
      });

    expect(response.status).toBe(400); // ZodError
  });

  it('GET /api/products - Debe listar productos con paginación', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);

    const paginatedSchema = z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
      data: z.array(productResponseSchema.passthrough())
    });

    const validatedBody = paginatedSchema.parse(response.body);
    const found = validatedBody.data.find(p => p.product_id === testProductId);
    expect(found).toBeDefined();
  });

  it('GET /api/products/:id - Debe obtener un producto por ID', async () => {
    const response = await request(app)
      .get(`/api/products/${testProductId}`);

    expect(response.status).toBe(200);
    const validatedData = productResponseSchema.parse(response.body);
    expect(validatedData.product_id).toBe(testProductId);
  });

  it('PUT /api/products/:id - Debe actualizar los datos del producto', async () => {
    const response = await request(app)
      .put(`/api/products/${testProductId}`)
      .send({
        name: `${testProductName} Modificado`,
        category: 'Licores Premium',
        measurement_unit: 'Botella de Litro',
        current_stock: 60,
        min_stock: 10
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');

    const validatedData = productResponseSchema.parse(response.body.data);
    expect(validatedData.name).toBe(`${testProductName} Modificado`);
    expect(validatedData.category).toBe('Licores Premium');
    expect(validatedData.current_stock).toBe(60);
  });

  it('DELETE /api/products/:id - Debe realizar una eliminación lógica del producto', async () => {
    const deleteResponse = await request(app)
      .delete(`/api/products/${testProductId}`);

    expect(deleteResponse.status).toBe(200);

    const getResponse = await request(app)
      .get(`/api/products/${testProductId}`);
    
    expect(getResponse.status).toBe(404);
  });
});
