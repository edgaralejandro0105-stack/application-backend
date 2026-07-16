const dashboardService = require('../services/dashboard.service');
const catchAsync = require('../utils/catchAsync');

exports.getSummary = catchAsync(async (req, res) => {
  const summary = await dashboardService.getSummary();
  res.status(200).json(summary);
});

exports.getDashboardData = catchAsync(async (req, res) => {
  const data = await dashboardService.getDashboardData(req.user);
  res.status(200).json(data);
});
