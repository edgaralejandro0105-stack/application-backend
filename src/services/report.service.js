const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Product } = require('../models');

class ReportService {
  async getActiveProducts() {
    return await Product.findAll({
      order: [['name', 'ASC']]
    });
  }

  async generateInventoryExcel() {
    const products = await this.getActiveProducts();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario Ciego');

    // Configuración de cabeceras de columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'name', width: 35 },
      { header: 'Categoría', key: 'category', width: 25 },
      { header: 'Stock Teórico', key: 'theoretical_stock', width: 15 },
      { header: 'Conteo Físico', key: 'physical_count', width: 20 }
    ];

    // Dar estilo a la primera fila (Cabecera)
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    // Añadir datos dinámicamente
    products.forEach(p => {
      worksheet.addRow({
        id: p.product_id,
        name: p.name,
        category: p.category,
        theoretical_stock: p.current_stock,
        physical_count: '' // Celda vacía para conteo físico manual
      });
    });

    // Devolvemos el buffer directamente para enviarlo vía HTTP
    return await workbook.xlsx.writeBuffer();
  }

  async generateInventoryPDF() {
    return new Promise(async (resolve, reject) => {
      try {
        const products = await this.getActiveProducts();
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Título del documento
        doc.fontSize(20).text('Reporte de Inventario Ciego', { align: 'center' });
        doc.moveDown(2);

        // Definimos las posiciones de las columnas (X)
        const nameX = 40;
        const categoryX = 250;
        const theoreticalX = 380;
        const physicalX = 480;
        let y = 100; // Posición Y inicial de la tabla

        // Imprimir cabeceras de tabla
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Nombre', nameX, y);
        doc.text('Categoría', categoryX, y);
        doc.text('Stock Teórico', theoreticalX, y);
        doc.text('Conteo Físico', physicalX, y);

        // Línea divisoria
        doc.moveTo(40, y + 15).lineTo(550, y + 15).stroke();

        y += 30; // Bajamos el cursor Y
        doc.font('Helvetica').fontSize(10);

        products.forEach((p) => {
          // Si nos acercamos al final de la hoja, creamos otra nueva
          if (y > 750) { 
            doc.addPage();
            y = 50;
          }
          
          doc.text(p.name.substring(0, 30), nameX, y);
          doc.text(p.category, categoryX, y);
          doc.text(p.current_stock.toString(), theoreticalX, y);
          
          // Línea para que escriban el conteo físico a mano
          doc.moveTo(physicalX, y + 10).lineTo(physicalX + 70, y + 10).stroke();

          y += 25; // Espaciado entre filas
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ReportService();
