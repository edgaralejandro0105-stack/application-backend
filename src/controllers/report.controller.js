const reportService = require('../services/report.service');
const catchAsync = require('../utils/catchAsync');

exports.getInventoryExcel = catchAsync(async (req, res) => {
  const buffer = await reportService.generateInventoryExcel();
  
  // Headers HTTP correctos para forzar la descarga de un Excel
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=inventario_ciego.xlsx');
  
  res.send(buffer);
});

exports.getInventoryPDF = catchAsync(async (req, res) => {
  const buffer = await reportService.generateInventoryPDF();
  
  // Headers HTTP correctos para forzar la descarga de un PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=inventario_ciego.pdf');
  
  res.send(buffer);
});

// --- NUEVOS CONTROLADORES DE PDF --- //

exports.getClientsPDF = catchAsync(async (req, res) => {
  const buffer = await reportService.generateClientsPDF();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=clientes.pdf');
  res.send(buffer);
});

exports.getProvidersPDF = catchAsync(async (req, res) => {
  const buffer = await reportService.generateProvidersPDF();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=proveedores.pdf');
  res.send(buffer);
});

exports.getSalesPDF = catchAsync(async (req, res) => {
  const buffer = await reportService.generateSalesPDF();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=ventas.pdf');
  res.send(buffer);
});

exports.getEmployeesPDF = catchAsync(async (req, res) => {
  const buffer = await reportService.generateEmployeesPDF();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=empleados.pdf');
  res.send(buffer);
});

exports.getEventContractPDF = catchAsync(async (req, res) => {
  const { Event, Client, Venue, EventItem, ServiceExternal, EventStaff, Employee } = require('../models');
  const event = await Event.findByPk(req.params.id, {
    include: [
      { model: Client, attributes: ['name', 'last_name', 'doc_id', 'phone', 'email'] },
      { model: Venue, attributes: ['venue_id', 'name'], through: { attributes: [] } },
      { model: EventItem, include: [{ model: ServiceExternal, attributes: ['name', 'service_type'] }] }
    ]
  });
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }
  const buffer = await reportService.generateEventContractPDF(event);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=contrato_evento_${event.event_id}.pdf`);
  res.send(buffer);
});
