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
router.patch('/my-events/:eventId/milestones/:milestoneId', clientAuthController.updateMilestone);
router.get('/my-invoices', clientAuthController.getMyInvoices);
router.get('/my-invoices/:saleId/payments', clientAuthController.getInvoicePayments);
router.post('/payments/simulate', clientAuthController.simulatePayment);

module.exports = router;
