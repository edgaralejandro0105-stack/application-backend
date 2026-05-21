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
