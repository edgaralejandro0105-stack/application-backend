const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const validateSchema = require('../middleware/validateSchema');
const { createEmployeeSchema } = require('../schemas/employee.schema');

// URL base: /api/employees
router.post('/', validateSchema(createEmployeeSchema), employeeController.createEmployee);
router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
