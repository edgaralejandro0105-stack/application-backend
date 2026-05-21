const request = require('supertest');
const app = require('../../src/server');
const { sequelize, Product } = require('../../src/models');
const { z } = require('zod');

let testProductId;
const uniqueSuffix = Date.now();

beforeAll(async () => {
  await sequelize.authenticate();

  // Crear un producto para que aparezca en el inventario/reporte
  const product = await Product.create({
    name: `Limonada Test Report ${uniqueSuffix}`,
    category: 'Bebidas',
    measurement_unit: 'Vaso',
    expiry_date: '2028-12-31',
    current_stock: 4, // menor o igual a 5 para aparecer en lowStockProducts
    min_stock: 1
  });
  testProductId = product.product_id;
});

afterAll(async () => {
  if (testProductId) {
    await Product.destroy({ where: { product_id: testProductId }, force: true });
  }
  await sequelize.close();
});

describe('Pruebas de Integración - Dashboard (/api/dashboard)', () => {
  it('GET /api/dashboard/summary - Debe obtener el resumen estadístico con la estructura esperada', async () => {
    const response = await request(app)
      .get('/api/dashboard/summary');

    expect(response.status).toBe(200);

    const summarySchema = z.object({
      eventsConfirmedThisMonth: z.number(),
      totalSalesThisWeek: z.number(),
      activeClients: z.number(),
      upcomingEvents: z.array(z.any()),
      lowStockProducts: z.array(z.any())
    });

    const validatedBody = summarySchema.parse(response.body);
    expect(validatedBody).toHaveProperty('eventsConfirmedThisMonth');
    expect(validatedBody).toHaveProperty('totalSalesThisWeek');
    expect(validatedBody).toHaveProperty('activeClients');
  });
});

describe('Pruebas de Integración - Reportes (/api/reports)', () => {
  it('GET /api/reports/inventory/excel - Debe descargar el archivo excel con cabecera correcta', async () => {
    const response = await request(app)
      .get('/api/reports/inventory/excel');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(response.headers['content-disposition']).toContain('attachment; filename=inventario_ciego.xlsx');
    expect(response.body).toBeDefined();
  });

  it('GET /api/reports/inventory/pdf - Debe descargar el archivo pdf con cabecera correcta', async () => {
    const response = await request(app)
      .get('/api/reports/inventory/pdf');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.headers['content-disposition']).toContain('attachment; filename=inventario_ciego.pdf');
    expect(response.body).toBeDefined();
  });
});
