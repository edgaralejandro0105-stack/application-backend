const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');

// Protegemos TODAS las rutas de usuarios exigiendo que tengan un token válido
// Al no pasar argumentos a requireRoles(), por defecto requiere nivel 3 (Administrador)
router.use(verifyToken);
router.use(requireRoles());

// URL base esperada: /api/users
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.patch('/:id', userController.updateUser);
router.put('/:id/password', userController.updatePassword);
router.delete('/:id', userController.deleteUser);

module.exports = router;