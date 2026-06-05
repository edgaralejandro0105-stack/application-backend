const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protegemos la ruta exigiendo token válido
router.use(verifyToken);

// URL base esperada: /api/roles
router.get('/', roleController.getAllRoles);

module.exports = router;
