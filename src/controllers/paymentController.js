const paymentService = require('../services/payment.service');
const catchAsync = require('../utils/catchAsync');

exports.getAllPayments = catchAsync(async (req, res) => {
  const result = await paymentService.getAllPayments(req.query);
  res.status(200).json(result);
});

exports.getPaymentById = catchAsync(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id);
  res.status(200).json({ data: payment });
});
