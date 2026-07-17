const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const validateSchema = require('../middleware/validateSchema');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../schemas/auth.schema');
const { loginLimiter } = require('../middleware/rateLimiter');

// URL base: /api/auth
router.post('/register', validateSchema(registerSchema), authController.register);
router.post('/login', loginLimiter, validateSchema(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

router.get('/profile', verifyToken, authController.getProfile);
router.post('/generate-reset-token', validateSchema(forgotPasswordSchema), authController.generateResetToken);
router.post('/forgot-password', validateSchema(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateSchema(resetPasswordSchema), authController.resetPassword);

module.exports = router;
