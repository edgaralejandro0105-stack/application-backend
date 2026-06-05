const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');
// const { protect } = require('../middleware/authMiddleware'); 
// Assuming there's some auth middleware, if not we just expose them

router.get('/', notificationController.getNotifications);
router.post('/', notificationController.createNotification);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
