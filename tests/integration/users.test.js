const request = require('supertest');
const app = require('../../src/server');
const { sequelize, User, Role } = require('../../src/models');
const { z } = require('zod');

// Esquema para validar la respuesta del Usuario (sin contraseña)
const userResponseSchema = z.object({
  user_id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role_id: z.number().nullable().optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
  create_at: z.string().optional(),
  update_at: z.string().optional(),
  Role: z.object({
    role_name: z.string(),
    access: z.number()
  }).optional()
});

let token = '';
let testAdminUserId;
let targetUserId;
const uniqueSuffix = Date.now();
const adminEmail = `admin_user_${uniqueSuffix}@example.com`;
const targetEmail = `target_user_${uniqueSuffix}@example.com`;

beforeAll(async () => {
  await sequelize.authenticate();

  // Asegurar el rol de admin
  const [role] = await Role.findOrCreate({
    where: { role_name: 'admin' },
    defaults: { role_name: 'admin', description: 'Administrador', access: 3 }
  });

  // Registrar un administrador de prueba para obtener el token
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Admin Test',
      email: adminEmail,
      password: 'Password123!',
      role_id: role.id
    });
  
  testAdminUserId = registerResponse.body.user.user_id;
  token = registerResponse.body.token;

  // Registrar un segundo usuario que modificaremos/eliminaremos
  const targetUser = await User.create({
    name: 'Target User',
    email: targetEmail,
    password: 'Password123!',
    role_id: role.id,
    status: 'active'
  });
  targetUserId = targetUser.user_id;
});

afterAll(async () => {
  if (targetUserId) {
    await User.destroy({ where: { user_id: targetUserId } });
  }
  if (testAdminUserId) {
    await User.destroy({ where: { user_id: testAdminUserId } });
  }
  await sequelize.close();
});

describe('Pruebas de Integración - Usuarios (/api/users)', () => {

  describe('Validación de Autenticación', () => {
    it('Debe devolver 401 Unauthorized si se llama a GET /api/users sin token JWT', async () => {
      const response = await request(app)
        .get('/api/users');
      expect(response.status).toBe(401);
    });
  });

  describe('Operaciones CRUD Autenticadas', () => {

    it('GET /api/users - Debe listar todos los usuarios (sin contraseñas)', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const validatedList = z.array(userResponseSchema.passthrough()).parse(response.body);
      const foundTarget = validatedList.find(u => u.user_id === targetUserId);
      expect(foundTarget).toBeDefined();
      expect(foundTarget).not.toHaveProperty('password');
    });

    it('GET /api/users/:id - Debe obtener un usuario específico por su ID', async () => {
      const response = await request(app)
        .get(`/api/users/${targetUserId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      const validatedData = userResponseSchema.passthrough().parse(response.body);
      expect(validatedData.user_id).toBe(targetUserId);
      expect(validatedData.email).toBe(targetEmail);
    });

    it('PUT /api/users/:id - Debe actualizar los datos generales del usuario', async () => {
      const response = await request(app)
        .put(`/api/users/${targetUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Target User Modificado',
          status: 'suspended'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');

      const validatedData = userResponseSchema.passthrough().parse(response.body.data);
      expect(validatedData.name).toBe('Target User Modificado');
      expect(validatedData.status).toBe('suspended');
    });

    it('PATCH /api/users/:id - Debe actualizar parcialmente los datos del usuario', async () => {
      const response = await request(app)
        .patch(`/api/users/${targetUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'active'
        });

      expect(response.status).toBe(200);
      const validatedData = userResponseSchema.passthrough().parse(response.body.data);
      expect(validatedData.status).toBe('active');
    });

    it('DELETE /api/users/:id - Debe eliminar un usuario de la base de datos', async () => {
      const deleteResponse = await request(app)
        .delete(`/api/users/${targetUserId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe('Usuario eliminado de la base de datos');

      // Verificar que el usuario ya no existe
      const getResponse = await request(app)
        .get(`/api/users/${targetUserId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(getResponse.status).toBe(404);
      targetUserId = null; // Evitar intento de eliminación duplicado en afterAll
    });
  });
});
