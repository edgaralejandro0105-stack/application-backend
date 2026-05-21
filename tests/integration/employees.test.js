const request = require('supertest');
jest.mock('../../src/services/email.service', () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
}));
const app = require('../../src/server');
const { sequelize, Employee, Role } = require('../../src/models');
const { z } = require('zod');

// Esquema de validación del Empleado para la respuesta de la API
const employeeResponseSchema = z.object({
  employee_id: z.number(),
  user_id: z.number().nullable().optional(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  rol: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().nullable().optional()
});

let testEmployeeId;
const uniqueSuffix = Date.now();
const testEmail = `employee_${uniqueSuffix}@example.com`;

beforeAll(async () => {
  await sequelize.authenticate();
  
  // Garantizar que los roles existen en la base de datos de pruebas
  await Role.findOrCreate({
    where: { role_name: 'Bartender' },
    defaults: { role_name: 'Bartender', description: 'Bartender' }
  });
  await Role.findOrCreate({
    where: { role_name: 'Manager' },
    defaults: { role_name: 'Manager', description: 'Manager' }
  });
});

afterAll(async () => {
  if (testEmployeeId) {
    // Usamos force: true para saltar el soft-delete en la base de datos de pruebas
    await Employee.destroy({ where: { employee_id: testEmployeeId }, force: true });
  }
  await sequelize.close();
});

describe('Pruebas de Integración - Empleados (/api/employees)', () => {

  it('POST /api/employees - Debe crear un nuevo empleado con datos válidos', async () => {
    const response = await request(app)
      .post('/api/employees')
      .send({
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '1234567890',
        email: testEmail,
        rol: 'Bartender',
        status: 'active'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');
    
    const validatedData = employeeResponseSchema.parse(response.body.data);
    expect(validatedData.first_name).toBe('Juan');
    expect(validatedData.email).toBe(testEmail);
    testEmployeeId = validatedData.employee_id;
  });

  it('POST /api/employees - Debe fallar al crear un empleado sin campos obligatorios', async () => {
    const response = await request(app)
      .post('/api/employees')
      .send({
        last_name: 'Pérez'
      });

    expect(response.status).toBe(400); // Bad Request de Zod
  });

  it('GET /api/employees - Debe listar empleados con formato de paginación', async () => {
    const response = await request(app)
      .get('/api/employees')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    
    const paginatedSchema = z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
      data: z.array(employeeResponseSchema.passthrough())
    });

    const validatedBody = paginatedSchema.parse(response.body);
    const found = validatedBody.data.find(emp => emp.employee_id === testEmployeeId);
    expect(found).toBeDefined();
  });

  it('GET /api/employees/:id - Debe obtener un empleado por su ID', async () => {
    const response = await request(app)
      .get(`/api/employees/${testEmployeeId}`);

    expect(response.status).toBe(200);
    const validatedData = employeeResponseSchema.parse(response.body);
    expect(validatedData.employee_id).toBe(testEmployeeId);
  });

  it('PUT /api/employees/:id - Debe actualizar los datos del empleado', async () => {
    const response = await request(app)
      .put(`/api/employees/${testEmployeeId}`)
      .send({
        first_name: 'Juan Modificado',
        last_name: 'Pérez',
        phone: '9876543210',
        email: testEmail,
        rol: 'Manager'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');

    const validatedData = employeeResponseSchema.parse(response.body.data);
    expect(validatedData.first_name).toBe('Juan Modificado');
    expect(validatedData.rol).toBe('Manager');
  });

  it('DELETE /api/employees/:id - Debe realizar una eliminación lógica del empleado (soft delete)', async () => {
    const deleteResponse = await request(app)
      .delete(`/api/employees/${testEmployeeId}`);

    expect(deleteResponse.status).toBe(200);

    // Verificar que no se pueda obtener el empleado mediante el endpoint normal (o que se retorne un error / no se encuentre)
    const getResponse = await request(app)
      .get(`/api/employees/${testEmployeeId}`);
    
    // Si la eliminación fue lógica, el endpoint de obtener por ID suele lanzar un error 404
    expect(getResponse.status).toBe(404);
  });
});
