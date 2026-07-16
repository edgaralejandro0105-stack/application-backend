const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, requireRoles } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireRoles('Gerente', 'Ventas'), paymentController.getAllPayments);
router.get('/:id', verifyToken, requireRoles('Gerente', 'Ventas'), paymentController.getPaymentById);

module.exports = router;
