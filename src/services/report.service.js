const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const path = require('path');
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

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'name', width: 35 },
      { header: 'Categoría', key: 'category', width: 25 },
      { header: 'Stock Teórico', key: 'theoretical_stock', width: 15 },
      { header: 'Conteo Físico', key: 'physical_count', width: 20 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    products.forEach(p => {
      worksheet.addRow({
        id: p.product_id,
        name: p.name,
        category: p.category,
        theoretical_stock: p.current_stock,
        physical_count: ''
      });
    });

    return await workbook.xlsx.writeBuffer();
  }

  _drawHeader(doc, title, subtitle = 'Sistema Integrado de Gestión Empresarial') {
    const logoPath = path.join(__dirname, '../templates/logo2.png');
    try {
      doc.image(logoPath, 478, 25, { fit: [70, 70], align: 'right' });
    } catch (e) {
      // Logo file not found, continue without it
    }

    doc.fillColor('#18181b').fontSize(24).font('Helvetica-Bold');
    doc.text('LA CASONA', 50, 40);

    doc.fillColor('#71717a').fontSize(10).font('Helvetica');
    doc.text(subtitle, 50, 68);

    doc.fillColor('#18181b').fontSize(16).font('Helvetica-Bold');
    doc.text(title, 50, 90, { align: 'right' });

    const now = new Date();
    const currentDate = now.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    doc.fillColor('#71717a').fontSize(10).font('Helvetica');
    doc.text(`Emitido: ${currentDate} ${timeStr}`, 50, 110, { align: 'right' });

    doc.moveTo(50, 133).lineTo(545, 133).lineWidth(1.5).strokeColor('#8b5cf6').stroke();

    return 148;
  }

  _drawCompactHeader(doc, title) {
    doc.fillColor('#18181b').fontSize(11).font('Helvetica-Bold');
    doc.text(title, 50, 20);
    doc.moveTo(50, 38).lineTo(545, 38).lineWidth(1).strokeColor('#e4e4e7').stroke();
    return 48;
  }

  _drawFooter(doc) {
    doc.fontSize(8).fillColor('#a1a1aa').font('Helvetica');
    doc.text('Generado automáticamente por La Casona Eventos', 50, 770, { align: 'center' });
    doc.text(`Página ${doc.page}`, 50, 783, { align: 'center' });
  }

  _colWidth(positions, i) {
    const start = positions[i];
    const end = positions[i + 1] || 545;
    return end - start - 6;
  }

  _drawTableHeader(doc, headers, positions, y, columnAlignments) {
    doc.rect(50, y - 5, 495, 25).fill('#8b5cf6');
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
    headers.forEach((h, i) => {
      const opts = { width: this._colWidth(positions, i), ellipsis: true };
      if (columnAlignments && columnAlignments[i]) {
        opts.align = columnAlignments[i];
      }
      doc.text(h, positions[i] + 3, y, opts);
    });
    return y + 30;
  }

  async generateInventoryPDF() {
    return new Promise(async (resolve, reject) => {
      try {
        const products = await this.getActiveProducts();

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        let y = this._drawHeader(doc, 'Reporte de Inventario Ciego');
        y += 10;

        const invPos = [50, 260, 380, 470];
        const nameX = invPos[0];
        const categoryX = invPos[1];
        const theoreticalX = invPos[2];
        const physicalX = invPos[3];

        doc.rect(50, y - 5, 495, 25).fill('#8b5cf6');
        doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
        doc.text('Nombre del Producto', nameX + 3, y, { width: this._colWidth(invPos, 0), ellipsis: true });
        doc.text('Categoría', categoryX + 3, y, { width: this._colWidth(invPos, 1), ellipsis: true });
        doc.text('Stock Teórico', theoreticalX, y, { width: this._colWidth(invPos, 2), align: 'center' });
        doc.text('Conteo Físico', physicalX, y, { width: this._colWidth(invPos, 3), align: 'center' });
        y += 30;

        doc.font('Helvetica').fontSize(10);

        products.forEach((p, index) => {
          if (y > 738) {
            this._drawFooter(doc);
            doc.addPage();
            y = this._drawCompactHeader(doc, 'Reporte de Inventario Ciego');
            y += 8;

            doc.rect(50, y - 5, 495, 25).fill('#8b5cf6');
            doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
            doc.text('Nombre del Producto', nameX + 3, y, { width: this._colWidth(invPos, 0), ellipsis: true });
            doc.text('Categoría', categoryX + 3, y, { width: this._colWidth(invPos, 1), ellipsis: true });
            doc.text('Stock Teórico', theoreticalX, y, { width: this._colWidth(invPos, 2), align: 'center' });
            doc.text('Conteo Físico', physicalX, y, { width: this._colWidth(invPos, 3), align: 'center' });
            y += 30;
          }

          if (index % 2 === 0) {
            doc.rect(50, y - 3, 495, 22).fill('#fafafa');
          }

          doc.fillColor('#27272a');
          doc.text(p.name, nameX + 3, y, { width: this._colWidth(invPos, 0), ellipsis: true });

          doc.fillColor('#52525b');
          doc.text(p.category, categoryX + 3, y, { width: this._colWidth(invPos, 1), ellipsis: true });

          doc.fillColor('#27272a').font('Helvetica-Bold');
          doc.text(p.current_stock.toString(), theoreticalX, y, { width: this._colWidth(invPos, 2), align: 'center' });
          doc.font('Helvetica');

          doc.moveTo(physicalX, y + 10).lineTo(physicalX + 60, y + 10).lineWidth(0.5).strokeColor('#a1a1aa').stroke();

          doc.moveTo(50, y + 18).lineTo(545, y + 18).lineWidth(0.5).strokeColor('#f4f4f5').stroke();

          y += 25;
        });

        this._drawFooter(doc);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  _generateBasePDF(title, headers, dataRows, columnWidths, columnAlignments) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        let y = this._drawHeader(doc, title);
        y += 10;

        y = this._drawTableHeader(doc, headers, columnWidths, y, columnAlignments);

        doc.font('Helvetica').fontSize(10);
        dataRows.forEach((row, index) => {
          if (y > 738) {
            this._drawFooter(doc);
            doc.addPage();
            y = this._drawCompactHeader(doc, title);
            y += 8;
            y = this._drawTableHeader(doc, headers, columnWidths, y, columnAlignments);
          }

          if (index % 2 === 0) {
            doc.rect(50, y - 3, 495, 22).fill('#fafafa');
          }

          row.forEach((text, i) => {
            const opts = { width: this._colWidth(columnWidths, i), ellipsis: true };
            if (columnAlignments && columnAlignments[i]) {
              opts.align = columnAlignments[i];
            }
            doc.fillColor('#27272a');
            doc.text(String(text), columnWidths[i] + 3, y, opts);
          });

          doc.moveTo(50, y + 18).lineTo(545, y + 18).lineWidth(0.5).strokeColor('#f4f4f5').stroke();
          y += 25;
        });

        this._drawFooter(doc);
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
    const columnWidths = [50, 235, 335, 425];
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
    const columnWidths = [50, 240, 370, 460];
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
    const alignments = [undefined, 'center', undefined];
    return this._generateBasePDF('Reporte de Ventas', headers, dataRows, columnWidths, alignments);
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
    const columnWidths = [50, 200, 300, 420, 485];
    return this._generateBasePDF('Reporte de Empleados', headers, dataRows, columnWidths);
  }

  generateEventContractPDF(event) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        let y = this._drawHeader(doc, `Evento #${event.event_id}`, 'Confirmación y Detalles de Evento');
        y += 10;

        // Client Details
        doc.fillColor('#18181b').fontSize(14).font('Helvetica-Bold').text('Datos del Cliente', 50, y);
        y += 28;
        doc.fontSize(10).font('Helvetica').fillColor('#27272a');
        doc.text(`Nombre: ${event.Client?.name || ''} ${event.Client?.last_name || ''}`, 50, y);
        doc.text(`Documento: ${event.Client?.doc_id || 'N/A'}`, 300, y);
        y += 20;
        doc.text(`Teléfono: ${event.Client?.phone || 'N/A'}`, 50, y);
        doc.text(`Correo: ${event.Client?.email || 'N/A'}`, 300, y);

        y += 40;
        doc.moveTo(50, y).lineTo(545, y).lineWidth(0.5).strokeColor('#e4e4e7').stroke();
        y += 20;

        // Event Details
        doc.fillColor('#18181b').fontSize(14).font('Helvetica-Bold').text('Detalles del Evento', 50, y);
        y += 28;
        doc.fontSize(10).font('Helvetica').fillColor('#27272a');

        let startDate = 'N/A', endDate = 'N/A';
        try {
            startDate = new Date(event.start_date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
            endDate = new Date(event.end_date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
        } catch(e) {}

        doc.text(`Tipo de Evento: ${event.type_event || 'N/A'}`, 50, y);
        doc.text(`Salón: ${event.Venue?.name || 'N/A'}`, 300, y);
        y += 20;
        doc.text(`Inicio: ${startDate}`, 50, y);
        doc.text(`Fin: ${endDate}`, 300, y);

        y += 40;
        doc.moveTo(50, y).lineTo(545, y).lineWidth(0.5).strokeColor('#e4e4e7').stroke();
        y += 20;

        // Services
        doc.fillColor('#18181b').fontSize(14).font('Helvetica-Bold').text('Servicios Contratados', 50, y);
        y += 28;
        if (event.EventItems && event.EventItems.length > 0) {
          event.EventItems.forEach((item) => {
            const svc = item.ServiceExternal;
            doc.fontSize(10).font('Helvetica').fillColor('#27272a');

            doc.circle(55, y + 4, 2.5).fill('#8b5cf6');
            doc.fillColor('#27272a');
            doc.text(`${svc?.name || 'Servicio'} (${svc?.service_type || 'General'})`, 65, y);
            y += 22;
          });
        } else {
          doc.fontSize(10).font('Helvetica-Oblique').fillColor('#71717a');
          doc.text('No hay servicios externos contratados para este evento.', 50, y);
          y += 22;
        }

        this._drawFooter(doc);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ReportService();
