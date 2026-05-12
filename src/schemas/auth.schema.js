const { z } = require('zod');

const registerSchema = z.object({
  name: z.string({ required_error: 'El nombre es requerido' }),
  email: z.string({ required_error: 'El email es requerido' }).email({ message: 'Formato de email inválido' }),
  password: z.string({ required_error: 'La contraseña es requerida' }).min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role_id: z.number().int().optional(),
});

const loginSchema = z.object({
    email: z.string({ required_error: 'El email es requerido' }).email({ message: 'Formato de email inválido' }),
    password: z.string({ required_error: 'La contraseña es requerida' }),
});

const recoverPasswordSchema = z.object({
    email: z.string({ required_error: 'El email es requerido' }).email({ message: 'Formato de email inválido' }),
    newPassword: z.string({ required_error: 'La nueva contraseña es requerida' }).min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

module.exports = { registerSchema, loginSchema, recoverPasswordSchema };