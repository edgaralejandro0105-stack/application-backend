const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');
const cacheMiddleware = require('../middleware/cache');

router.get('/', verifyToken, cacheMiddleware(60, 'dashboard'), dashboardController.getDashboardData);
router.get('/summary', cacheMiddleware(60, 'dashboard'), dashboardController.getSummary);

module.exports = router;
