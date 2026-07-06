const express = require('express');
const router = express.Router();
const clientAuthController = require('../controllers/clientAuthController');
const { verifyClientToken } = require('../middleware/authMiddleware');

// Auth
router.post('/login', clientAuthController.login);

// Protected routes
router.use(verifyClientToken);
router.get('/my-events', clientAuthController.getMyEvents);
router.get('/my-events/:eventId/milestones', clientAuthController.getEventMilestones);
router.get('/my-invoices', clientAuthController.getMyInvoices);

module.exports = router;
