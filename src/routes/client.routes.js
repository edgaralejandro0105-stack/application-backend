const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');

// Definición de Endpoints para Clientes
// URL base: /api/clients

router.post('/', clientController.createClient);      // Crear cliente
router.get('/', clientController.getAllClients);     // Obtener todos
router.get('/:id', clientController.getClientById);  // Obtener uno por ID
router.put('/:id', clientController.updateClient);   // Actualizar
router.delete('/:id', clientController.deleteClient); // Eliminar (Soft delete o físico)

module.exports = router;