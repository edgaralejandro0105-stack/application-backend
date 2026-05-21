const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

// GET /api/reports/inventory/excel
router.get('/inventory/excel', reportController.getInventoryExcel);

// GET /api/reports/inventory/pdf
router.get('/inventory/pdf', reportController.getInventoryPDF);

module.exports = router;
