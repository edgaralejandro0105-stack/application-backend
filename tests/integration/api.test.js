const request = require('supertest');
jest.mock('../../src/services/email.service', () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
}));
const app = require('../../src/server');
const { sequelize, User, Client, Role } = require('../../src/models');
const { z } = require('zod');


// usuario
const userSchema = z.object({
  user_id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role_id: z.number().nullable().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional()
});

// Login/Register
const loginResponseSchema = z.object({

  message: z.string(),
  user: userSchema,
  token: z.string() // Validamos 
});

// cliente
const clientSchema = z.object({
  client_id: z.number(),
  name: z.string(),
  last_name: z.string(),
  doc_id: z.string(),
  phone: z.string().nullable().optional(),
  direction: z.string().nullable().optional(),
  created_at: z.string().optional(),
  update_at: z.string().optional()
});

const createClientResponseSchema = z.object({
  message: z.string(),
  data: clientSchema.passthrough()
});


let token = '';
let testUserId;
let testClientId;
let testRoleId;

const uniqueSuffix = Date.now();
const testEmail = `testuser_${uniqueSuffix}@example.com`;
const testDocId = `DOC_${uniqueSuffix}`;


beforeAll(async () => {
  await sequelize.authenticate();

  // Asegurar columnas de recuperación de contraseña en tests
  await sequelize.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255);`
  ).catch(() => { });
  await sequelize.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;`
  ).catch(() => { });

  const [role] = await Role.findOrCreate({
    where: { role_name: 'admin' },
    defaults: { role_name: 'admin', description: 'Administrador' }
  });
  testRoleId = role.id;
});


afterAll(async () => {

  if (testClientId) {
    await Client.destroy({ where: { client_id: testClientId } });
  }
  if (testUserId) {
    await User.destroy({ where: { user_id: testUserId } });
  }

  await sequelize.close();
});

describe('Integración de Endpoints Críticos (API)', () => {


  describe('Auth Endpoints', () => {

    it('POST /api/auth/register - Debe registrar un nuevo usuario', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: testEmail, // Email único autogenerado arriba
          password: 'Password123!',
          role_id: testRoleId
        });


      expect(response.status).toBe(201);

      const validatedBody = loginResponseSchema.parse(response.body);


      expect(validatedBody.message).toBe('Usuario registrado exitosamente');

      testUserId = validatedBody.user.user_id;
    });

    it('POST /api/auth/login - Debe iniciar sesión', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'Password123!'
        });


      expect(response.status).toBe(200);

      const validatedBody = loginResponseSchema.parse(response.body);

      expect(validatedBody.message).toBe('Inicio de sesión exitoso');

      token = validatedBody.token;
    });

    it('GET /api/auth/profile - Debe obtener el perfil del usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);


      const profileSchema = z.object({
        user_id: z.number(),
        name: z.string(),
        email: z.string().email(),
        role_id: z.number().nullable().optional(),
        status: z.string()
      }).passthrough();

      profileSchema.parse(response.body);

      expect(response.body.email).toBe(testEmail);
    });

    it('POST /api/auth/forgot-password - Debe responder con mensaje genérico e iniciar flujo de recuperación', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testEmail });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Si el correo está registrado, se enviará un enlace de recuperación.');

      // Verificar en la DB que el token y expiración existan
      const user = await User.findOne({ where: { email: testEmail } });
      expect(user.reset_password_token).not.toBeNull();
      expect(user.reset_password_expires).not.toBeNull();
    });

    it('POST /api/auth/forgot-password - Debe responder genéricamente si el email no existe (seguridad)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'no_existe_este_correo_123@lacasona.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Si el correo está registrado, se enviará un enlace de recuperación.');
    });

    it('POST /api/auth/reset-password - Debe restablecer contraseña con token válido y luego invalidarlo', async () => {
      const userBefore = await User.findOne({ where: { email: testEmail } });
      const tokenRecuperacion = userBefore.reset_password_token;

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: tokenRecuperacion,
          newPassword: 'NuevaContrasenaSegura123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Contraseña actualizada exitosamente.');

      // Verificar que los tokens queden limpios (null)
      const userAfter = await User.findOne({ where: { email: testEmail } });
      expect(userAfter.reset_password_token).toBeNull();
      expect(userAfter.reset_password_expires).toBeNull();

      // Verificar login exitoso con nueva contraseña
      const loginResp = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'NuevaContrasenaSegura123!'
        });
      expect(loginResp.status).toBe(200);
    });

    it('POST /api/auth/reset-password - Debe fallar si el token es inválido o no existe', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'token_falso_e_invalido',
          newPassword: 'NuevaContrasenaSegura123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Token inválido o expirado');
    });
  });

  describe('Clients Endpoints', () => {

    it('POST /api/clients - Debe crear un nuevo cliente', async () => {
      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Cliente',
          last_name: 'De Prueba',
          doc_id: testDocId,
          phone: '1234567890',
          direction: 'Calle Falsa 123'
        });

      expect(response.status).toBe(201);

      const validatedBody = createClientResponseSchema.parse(response.body);
      testClientId = validatedBody.data.client_id;
    });

    it('GET /api/clients - Debe listar clientes (Paginación incluida)', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      // Validamos no solo el array de clientes, sino que respetemos la estructura de paginación que devuelve la API
      const listClientsSchema = z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
        data: z.array(clientSchema.passthrough()) // Validamos que "data" es un array de clientes válidos
      });

      const validatedBody = listClientsSchema.parse(response.body);

      // Lógica de negocio: Validamos que dentro de toda la lista, existe el cliente que acabamos de crear arriba
      const clientFound = validatedBody.data.find(c => c.client_id === testClientId);
      expect(clientFound).toBeDefined(); // Si clientFound es undefined, significa que el POST falló o el GET no trae datos reales
    });

    it('PUT /api/clients/:id - Debe actualizar un cliente existente', async () => {
      const response = await request(app)
        // Pasamos el testClientId en la URL de forma dinámica
        .put(`/api/clients/${testClientId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Cliente Actualizado',
          last_name: 'Modificado',
          doc_id: testDocId,
          phone: '0987654321', // Nuevo teléfono
          direction: 'Avenida Siempre Viva 742' // Nueva dirección
        });

      // Esperamos que el servidor procese el PUT exitosamente
      expect(response.status).toBe(200);

      const updateResponseSchema = z.object({
        message: z.string(),
        data: clientSchema.passthrough()
      });

      const validatedBody = updateResponseSchema.parse(response.body);

      expect(validatedBody.data.name).toBe('Cliente Actualizado');
      expect(validatedBody.data.phone).toBe('0987654321');
    });
  });
});

