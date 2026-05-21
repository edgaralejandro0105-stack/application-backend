const { z } = require('zod');

const registerSchema = z.object({
  name: z.string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  email: z.string({ required_error: 'El email es requerido' })
    .trim()
    .toLowerCase()
    .email({ message: 'Formato de email inválido' }),
  password: z.string({ required_error: 'La contraseña es requerida' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  role_id: z.number().int().positive().optional(),
});

const loginSchema = z.object({
  email: z.string({ required_error: 'El email es requerido' })
    .trim()
    .toLowerCase()
    .email({ message: 'Formato de email inválido' }),
  password: z.string({ required_error: 'La contraseña es requerida' })
    .min(1, 'La contraseña no puede estar vacía'),
});

const forgotPasswordSchema = z.object({
  email: z.string({ required_error: 'El email es requerido' })
    .trim()
    .toLowerCase()
    .email({ message: 'Formato de email inválido' }),
});

const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'El token es requerido' }),
  newPassword: z.string({ required_error: 'La nueva contraseña es requerida' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

module.exports = { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };