const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protegemos TODAS las rutas de usuarios exigiendo que tengan un token válido
router.use(verifyToken);

// URL base esperada: /api/users
router.get('/', userController.getAllUsers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;