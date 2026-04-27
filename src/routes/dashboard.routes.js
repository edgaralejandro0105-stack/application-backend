const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// URL base: /api/dashboard
router.get('/summary', dashboardController.getSummary);

module.exports = router;
