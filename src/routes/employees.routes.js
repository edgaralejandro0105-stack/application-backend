const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const validateSchema = require('../middleware/validateSchema');
const { createEmployeeSchema } = require('../schemas/employee.schema');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');

// Rutas públicas (para la web)
router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);

// A partir de aquí, protegemos las rutas internas
router.use(verifyToken);
router.use(requireRoles('Gerente'));

// URL base: /api/employees
router.post('/', validateSchema(createEmployeeSchema), employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);
router.put('/:id/restore', employeeController.restoreEmployee);

module.exports = router;
