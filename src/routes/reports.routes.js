const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

// GET /api/reports/inventory/excel
router.get('/inventory/excel', reportController.getInventoryExcel);

// GET /api/reports/inventory/pdf
router.get('/inventory/pdf', reportController.getInventoryPDF);

// Nuevas rutas PDF
router.get('/clients/pdf', reportController.getClientsPDF);
router.get('/providers/pdf', reportController.getProvidersPDF);
router.get('/sales/pdf', reportController.getSalesPDF);
router.get('/employees/pdf', reportController.getEmployeesPDF);
router.get('/events/:id/contract', reportController.getEventContractPDF);

module.exports = router;
