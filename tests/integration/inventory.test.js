const request = require('supertest');
const app = require('../../src/server');
const { sequelize, InventoryBar, Product } = require('../../src/models');
const { z } = require('zod');

const inventoryResponseSchema = z.object({
  inventory_id: z.number(),
  product_id: z.number(),
  user_id: z.number().nullable().optional(),
  movement_type: z.enum(['Entry', 'Exit', 'Adjustment']),
  quantity: z.union([z.string(), z.number()]),
  unit_price: z.union([z.string(), z.number()]).nullable().optional(),
  date: z.string().optional()
});

let testProductId;
let testInventoryId;
const uniqueSuffix = Date.now();

beforeAll(async () => {
  await sequelize.authenticate();

  // Crear un producto para relacionar el inventario
  const product = await Product.create({
    name: `Ron Test Inv ${uniqueSuffix}`,
    category: 'Licores',
    measurement_unit: 'Botella',
    expiry_date: '2028-12-31',
    current_stock: 10,
    min_stock: 2
  });
  testProductId = product.product_id;
});

afterAll(async () => {
  if (testInventoryId) {
    await InventoryBar.destroy({ where: { inventory_id: testInventoryId } });
  }
  if (testProductId) {
    await Product.destroy({ where: { product_id: testProductId }, force: true });
  }
  await sequelize.close();
});

describe('Pruebas de Integración - Inventario (/api/inventory)', () => {

  it('POST /api/inventory - Debe crear un nuevo movimiento de inventario', async () => {
    const response = await request(app)
      .post('/api/inventory')
      .send({
        product_id: testProductId,
        quantity: 15,
        movement_type: 'Entry',
        unit_price: 25.50
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');

    const validatedData = inventoryResponseSchema.parse(response.body.data);
    expect(validatedData.product_id).toBe(testProductId);
    expect(Number(validatedData.quantity)).toBe(15);
    expect(validatedData.movement_type).toBe('Entry');
    testInventoryId = validatedData.inventory_id;
  });

  it('POST /api/inventory - Debe fallar si faltan campos obligatorios o son incorrectos', async () => {
    const response = await request(app)
      .post('/api/inventory')
      .send({
        product_id: testProductId,
        quantity: -5 // Cantidad inválida (debe ser positiva)
      });

    expect(response.status).toBe(400); // ZodError
  });

  it('GET /api/inventory - Debe listar movimientos de inventario con paginación', async () => {
    const response = await request(app)
      .get('/api/inventory')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);

    const paginatedSchema = z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
      data: z.array(inventoryResponseSchema.passthrough())
    });

    const validatedBody = paginatedSchema.parse(response.body);
    const found = validatedBody.data.find(item => item.inventory_id === testInventoryId);
    expect(found).toBeDefined();
  });

  it('GET /api/inventory/:id - Debe obtener un movimiento de inventario por ID', async () => {
    const response = await request(app)
      .get(`/api/inventory/${testInventoryId}`);

    expect(response.status).toBe(200);
    const validatedData = inventoryResponseSchema.parse(response.body);
    expect(validatedData.inventory_id).toBe(testInventoryId);
  });

  it('PUT /api/inventory/:id - Debe actualizar los datos del movimiento', async () => {
    const response = await request(app)
      .put(`/api/inventory/${testInventoryId}`)
      .send({
        quantity: 20,
        movement_type: 'Adjustment',
        unit_price: 30.00
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');

    const validatedData = inventoryResponseSchema.parse(response.body.data);
    expect(Number(validatedData.quantity)).toBe(20);
    expect(validatedData.movement_type).toBe('Adjustment');
  });

  it('DELETE /api/inventory/:id - Debe eliminar un movimiento de inventario de la base de datos', async () => {
    const deleteResponse = await request(app)
      .delete(`/api/inventory/${testInventoryId}`);

    expect(deleteResponse.status).toBe(200);

    const getResponse = await request(app)
      .get(`/api/inventory/${testInventoryId}`);
    
    expect(getResponse.status).toBe(404);
    testInventoryId = null; // Evitar eliminación duplicada en afterAll
  });
});
