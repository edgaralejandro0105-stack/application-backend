const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const validateSchema = require('../middleware/validateSchema');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../schemas/auth.schema');

// URL base: /api/auth
router.post('/register', validateSchema(registerSchema), authController.register); // Zod valida antes de registrar
router.post('/login', validateSchema(loginSchema), authController.login); // Zod valida antes del login
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Nuevas rutas para la evaluación
router.get('/profile', verifyToken, authController.getProfile);
router.post('/forgot-password', validateSchema(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateSchema(resetPasswordSchema), authController.resetPassword);

module.exports = router;
