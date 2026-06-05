const { Notification } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getNotifications = catchAsync(async (req, res) => {
  // If user_id is provided in query, fetch user specific, otherwise fetch global + user
  // Or simply fetch all notifications
  const options = {
    order: [['createdAt', 'DESC']],
    limit: 50 // Limit to last 50 for performance
  };

  const notifications = await Notification.findAll(options);
  res.status(200).json(notifications);
});

exports.createNotification = catchAsync(async (req, res) => {
  const { title, message, type, user_id } = req.body;
  const newNotification = await Notification.create({
    title,
    message,
    type,
    user_id: user_id || null
  });

  // Emit to socket if configured
  if (req.app.get('io')) {
    req.app.get('io').emit('new_notification', newNotification);
  }

  res.status(201).json(newNotification);
});

exports.markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findByPk(id);
  
  if (!notification) {
    throw new AppError('Notificación no encontrada', 404);
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({ message: 'Notificación marcada como leída', data: notification });
});
