const clientAuthService = require('../services/clientAuth.service');
const catchAsync = require('../utils/catchAsync');

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { client, token } = await clientAuthService.login(email, password);
  
  res.status(200).json({
    message: 'Inicio de sesión exitoso',
    client: {
      client_id: client.client_id,
      name: client.name,
      last_name: client.last_name,
      email: client.email,
      doc_id: client.doc_id
    },
    token
  });
});

exports.getMyEvents = catchAsync(async (req, res) => {
  const events = await clientAuthService.getMyEvents(req.user.client_id);
  res.status(200).json(events);
});

exports.getEventMilestones = catchAsync(async (req, res) => {
  const milestones = await clientAuthService.getEventMilestones(req.user.client_id, req.params.eventId);
  res.status(200).json(milestones);
});

exports.getMyInvoices = catchAsync(async (req, res) => {
  const invoices = await clientAuthService.getMyInvoices(req.user.client_id);
  res.status(200).json(invoices);
});
