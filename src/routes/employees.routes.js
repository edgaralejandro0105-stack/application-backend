const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const validateSchema = require('../middleware/validateSchema');
const { createEmployeeSchema } = require('../schemas/employee.schema');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');
const cacheMiddleware = require('../middleware/cache');

router.get('/', cacheMiddleware(120, 'employees'), employeeController.getAllEmployees);
router.get('/:id', cacheMiddleware(120, 'employees'), employeeController.getEmployeeById);

router.use(verifyToken);
router.use(requireRoles('Gerente'));

router.post('/', validateSchema(createEmployeeSchema), employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);
router.put('/:id/restore', employeeController.restoreEmployee);

module.exports = router;
