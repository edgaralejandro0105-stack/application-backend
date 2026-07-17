const clientAuthService = require('../services/clientAuth.service');
const catchAsync = require('../utils/catchAsync');
const { recordFailedAttempt, clearAttempts } = require('../middleware/rateLimiter');

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';

  try {
    const { client, token } = await clientAuthService.login(email, password);
    clearAttempts(ip);
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
  } catch (error) {
    recordFailedAttempt(ip);
    throw error;
  }
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

exports.getInvoicePayments = catchAsync(async (req, res) => {
  const payments = await clientAuthService.getInvoicePayments(req.user.client_id, req.params.saleId);
  res.status(200).json(payments);
});

exports.updateMilestone = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!status || !['Completed', 'In Progress', 'Pending'].includes(status)) {
    return res.status(400).json({ message: 'Estado inválido. Debe ser: Completed, In Progress o Pending' });
  }
  const milestone = await clientAuthService.updateMilestone(req.user.client_id, req.params.eventId, req.params.milestoneId, status);
  res.status(200).json(milestone);
});

exports.simulatePayment = catchAsync(async (req, res) => {
  const { sale_id, amount, payment_method } = req.body;

  if (!sale_id || !amount || !payment_method) {
    return res.status(400).json({ message: 'Faltan campos requeridos: sale_id, amount, payment_method' });
  }

  const validMethods = ['Zelle', 'Efectivo', 'Transferencia', 'Punto de Venta', 'Pago Móvil'];
  if (!validMethods.includes(payment_method)) {
    return res.status(400).json({
      message: `Método de pago inválido. Válidos: ${validMethods.join(', ')}`
    });
  }

  const result = await clientAuthService.simulatePayment(
    req.user.client_id,
    sale_id,
    amount,
    payment_method
  );

  res.status(200).json({
    success: true,
    message: 'Pago simulado exitosamente',
    ...result
  });
});
