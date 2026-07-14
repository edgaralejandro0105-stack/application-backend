const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const cacheMiddleware = require('../middleware/cache');

router.get('/summary', cacheMiddleware(60, 'dashboard'), dashboardController.getSummary);

module.exports = router;
