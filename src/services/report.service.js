const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Product, Client, Provider, Sale, Employee } = require('../models');

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

    return await workbook.xlsx.writeBuffer();
  }

  async generateInventoryPDF() {
    return new Promise(async (resolve, reject) => {
      try {
        const products = await this.getActiveProducts();
        
        // Configuración moderna de márgenes y tamaño (Enterprise UI)
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // ================= HEADER =================
        // Estilo Enterprise: Texto limpio, fuentes Sans-Serif (Helvetica)
        doc.fillColor('#18181b').fontSize(24).font('Helvetica-Bold');
        doc.text('LA CASONA', 50, 50);
        
        doc.fillColor('#71717a').fontSize(10).font('Helvetica');
        doc.text('Sistema Integrado de Gestión Empresarial', 50, 78);
        
        // Título del reporte alineado a la derecha
        doc.fillColor('#18181b').fontSize(16).font('Helvetica-Bold');
        doc.text('Reporte de Inventario Ciego', 200, 50, { align: 'right' });
        
        // Fecha del reporte
        const currentDate = new Date().toLocaleDateString('es-ES', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        doc.fillColor('#71717a').fontSize(10).font('Helvetica');
        doc.text(`Fecha de emisión: ${currentDate}`, 200, 70, { align: 'right' });

        // Línea separadora del header
        doc.moveTo(50, 110).lineTo(545, 110).lineWidth(1).strokeColor('#e4e4e7').stroke();
        
        // ================= TABLA =================
        const startY = 140;
        let y = startY;
        
        // Configuración de columnas
        const nameX = 50;
        const categoryX = 260;
        const theoreticalX = 380;
        const physicalX = 470;

        // Fondo de cabecera de tabla
        doc.rect(50, y - 5, 495, 25).fill('#f4f4f5');
        
        // Textos de cabecera
        doc.fillColor('#3f3f46').fontSize(10).font('Helvetica-Bold');
        doc.text('Nombre del Producto', nameX, y);
        doc.text('Categoría', categoryX, y);
        doc.text('Stock Teórico', theoreticalX, y);
        doc.text('Conteo Físico', physicalX, y);

        y += 30; // Mover el cursor debajo de la cabecera

        // Filas de datos
        doc.font('Helvetica').fontSize(10);

        products.forEach((p, index) => {
          if (y > 750) { 
            doc.addPage();
            y = 50; // Reiniciar Y en la nueva página
          }
          
          doc.fillColor('#27272a');
          doc.text(p.name.substring(0, 35), nameX, y);
          
          doc.fillColor('#52525b');
          doc.text(p.category, categoryX, y);
          
          doc.fillColor('#27272a').font('Helvetica-Bold');
          doc.text(p.current_stock.toString(), theoreticalX, y);
          doc.font('Helvetica'); // Resetear fuente para que el resto no sea Bold
          
          // Línea para escritura manual del conteo (estilo limpio)
          doc.moveTo(physicalX, y + 10).lineTo(physicalX + 60, y + 10).lineWidth(0.5).strokeColor('#a1a1aa').stroke();
          
          // Línea separadora de filas muy sutil
          doc.moveTo(50, y + 15).lineTo(545, y + 15).lineWidth(0.5).strokeColor('#f4f4f5').stroke();

          y += 25; // Espaciado entre filas
        });

        doc.fontSize(8).fillColor('#a1a1aa');
        doc.text('Generado automáticamente por La Casona Eventos', 50, 800, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // --- MÉTODOS DE EXPORTACIÓN A PDF PARA OTROS MÓDULOS --- //
  
  _generateBasePDF(title, headers, dataRows, columnWidths) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        // HEADER
        doc.fillColor('#18181b').fontSize(24).font('Helvetica-Bold');
        doc.text('LA CASONA', 50, 50);
        doc.fillColor('#71717a').fontSize(10).font('Helvetica');
        doc.text('Sistema Integrado de Gestión Empresarial', 50, 78);
        doc.fillColor('#18181b').fontSize(16).font('Helvetica-Bold');
        doc.text(title, 200, 50, { align: 'right' });
        
        const currentDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.fillColor('#71717a').fontSize(10).font('Helvetica');
        doc.text(`Fecha de emisión: ${currentDate}`, 200, 70, { align: 'right' });

        doc.moveTo(50, 110).lineTo(545, 110).lineWidth(1).strokeColor('#e4e4e7').stroke();

        // TABLA HEADER
        let y = 140;
        doc.rect(50, y - 5, 495, 25).fill('#f4f4f5');
        doc.fillColor('#3f3f46').fontSize(10).font('Helvetica-Bold');
        
        headers.forEach((h, i) => {
          doc.text(h, columnWidths[i], y);
        });

        y += 30;
        
        // TABLA DATOS
        doc.font('Helvetica').fontSize(10);
        dataRows.forEach(row => {
          if (y > 750) { 
            doc.addPage();
            y = 50; 
          }
          row.forEach((text, i) => {
            doc.fillColor('#27272a');
            doc.text(String(text).substring(0, 40), columnWidths[i], y);
          });
          doc.moveTo(50, y + 15).lineTo(545, y + 15).lineWidth(0.5).strokeColor('#f4f4f5').stroke();
          y += 25;
        });

        // FOOTER
        doc.fontSize(8).fillColor('#a1a1aa');
        doc.text('Generado automáticamente por La Casona Eventos', 50, 800, { align: 'center' });
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateClientsPDF() {
    const clients = await Client.findAll({ order: [['name', 'ASC']] });
    const headers = ['Nombre', 'Documento', 'Teléfono', 'Dirección'];
    const dataRows = clients.map(c => [
      `${c.name} ${c.last_name}`, 
      c.doc_id, 
      c.phone || 'N/A', 
      c.direction || 'N/A'
    ]);
    const columnWidths = [50, 200, 300, 400];
    return this._generateBasePDF('Reporte de Clientes', headers, dataRows, columnWidths);
  }

  async generateProvidersPDF() {
    const providers = await Provider.findAll({ order: [['name', 'ASC']] });
    const headers = ['Razón Social', 'Contacto', 'Teléfono', 'Estado'];
    const dataRows = providers.map(p => [
      p.name, 
      p.contact_name || 'N/A', 
      p.phone || 'N/A', 
      p.status === 'active' ? 'Activo' : 'Inactivo'
    ]);
    const columnWidths = [50, 250, 380, 480];
    return this._generateBasePDF('Reporte de Proveedores', headers, dataRows, columnWidths);
  }

  async generateSalesPDF() {
    const sales = await Sale.findAll({ order: [['create_at', 'DESC']] });
    const headers = ['ID Venta', 'Total', 'Fecha'];
    const dataRows = sales.map(s => [
      `#${s.sale_id}`, 
      `$${Number(s.total).toFixed(2)}`, 
      new Date(s.create_at).toLocaleDateString()
    ]);
    const columnWidths = [50, 250, 400];
    return this._generateBasePDF('Reporte de Ventas', headers, dataRows, columnWidths);
  }

  async generateEmployeesPDF() {
    const employees = await Employee.findAll({ order: [['first_name', 'ASC']] });
    const headers = ['Nombre', 'Teléfono', 'Email', 'Rol', 'Estado'];
    const dataRows = employees.map(e => [
      `${e.first_name} ${e.last_name}`, 
      e.phone || 'N/A', 
      e.email || 'N/A', 
      e.rol || 'N/A',
      e.status === 'active' ? 'Activo' : 'Inactivo'
    ]);
    const columnWidths = [50, 180, 280, 400, 480];
    return this._generateBasePDF('Reporte de Empleados', headers, dataRows, columnWidths);
  }
}

module.exports = new ReportService();
