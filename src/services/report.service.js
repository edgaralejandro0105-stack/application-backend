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
      doc.image(logoPath, 458, 22, { fit: [75, 75], align: 'right' });
    } catch (e) {}

    // Background header bar
    doc.rect(50, 30, 495, 80).fill('#f8f4ff');
    doc.rect(50, 30, 6, 80).fill('#8b5cf6');

    doc.fillColor('#18181b').fontSize(26).font('Helvetica-Bold');
    doc.text('LA CASONA', 70, 42);

    doc.fillColor('#52525b').fontSize(9).font('Helvetica');
    doc.text(subtitle, 70, 72);

    doc.fillColor('#8b5cf6').fontSize(14).font('Helvetica-Bold');
    doc.text(title, 450, 52, { align: 'right' });

    const now = new Date();
    const currentDate = now.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    doc.fillColor('#a1a1aa').fontSize(8).font('Helvetica');
    doc.text(`Emitido: ${currentDate} ${timeStr}`, 450, 70, { align: 'right' });

    // Shadow line
    doc.moveTo(50, 115).lineTo(545, 115).lineWidth(2).strokeColor('#8b5cf6').stroke();

    return 130;
  }

  _drawCompactHeader(doc, title) {
    doc.rect(50, 12, 495, 22).fill('#f8f4ff');
    doc.rect(50, 12, 4, 22).fill('#8b5cf6');
    doc.fillColor('#18181b').fontSize(10).font('Helvetica-Bold');
    doc.text(title, 62, 16);
    doc.moveTo(50, 38).lineTo(545, 38).lineWidth(1).strokeColor('#e4e4e7').stroke();
    return 48;
  }

  _drawFooter(doc) {
    doc.rect(50, 755, 495, 35).fill('#f8f4ff');
    doc.fillColor('#a1a1aa').fontSize(8).font('Helvetica');
    doc.text('Generado automáticamente por La Casona Eventos', 50, 762, { align: 'center' });
    doc.text(`Página ${doc.page}`, 50, 775, { align: 'center' });
  }

  _colWidth(positions, i) {
    const start = positions[i];
    const end = positions[i + 1] || 545;
    return end - start - 10;
  }

  _drawTableHeader(doc, headers, positions, y, columnAlignments) {
    // Header background with rounded look
    doc.rect(50, y - 4, 495, 26).fill('#8b5cf6');
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
    headers.forEach((h, i) => {
      const opts = { width: this._colWidth(positions, i) };
      if (columnAlignments && columnAlignments[i]) {
        opts.align = columnAlignments[i];
      }
      doc.text(h, positions[i] + 5, y + 2, opts);
    });
    return y + 32;
  }

  _drawTableRow(doc, row, positions, y, columnAlignments, index) {
    // Row background alternating
    if (index % 2 === 0) {
      doc.rect(50, y - 3, 495, 24).fill('#fafafa');
    }

    // Bottom border
    doc.moveTo(50, y + 21).lineTo(545, y + 21).lineWidth(0.5).strokeColor('#e4e4e7').stroke();

    row.forEach((text, i) => {
      const opts = { width: this._colWidth(positions, i) };
      if (columnAlignments && columnAlignments[i]) {
        opts.align = columnAlignments[i];
      }
      doc.fillColor('#27272a').fontSize(9).font('Helvetica');
      doc.text(String(text), positions[i] + 5, y + 2, opts);
    });
  }

  async generateInventoryPDF() {
    return new Promise(async (resolve, reject) => {
      try {
        const products = await this.getActiveProducts();
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        let y = this._drawHeader(doc, 'Inventario Ciego');
        y += 12;

        const invPos = [50, 240, 370, 470];
        const nameX = invPos[0];
        const categoryX = invPos[1];
        const theoreticalX = invPos[2];
        const physicalX = invPos[3];

        doc.rect(50, y - 4, 495, 26).fill('#8b5cf6');
        doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
        doc.text('Nombre del Producto', nameX + 5, y + 2, { width: this._colWidth(invPos, 0) });
        doc.text('Categoría', categoryX + 5, y + 2, { width: this._colWidth(invPos, 1) });
        doc.text('Stock Teórico', theoreticalX, y + 2, { width: this._colWidth(invPos, 2), align: 'center' });
        doc.text('Conteo Físico', physicalX, y + 2, { width: this._colWidth(invPos, 3), align: 'center' });
        y += 32;

        products.forEach((p, index) => {
          if (y > 740) {
            this._drawFooter(doc);
            doc.addPage();
            y = this._drawCompactHeader(doc, 'Inventario Ciego');
            y += 8;
            doc.rect(50, y - 4, 495, 26).fill('#8b5cf6');
            doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
            doc.text('Nombre del Producto', nameX + 5, y + 2, { width: this._colWidth(invPos, 0) });
            doc.text('Categoría', categoryX + 5, y + 2, { width: this._colWidth(invPos, 1) });
            doc.text('Stock Teórico', theoreticalX, y + 2, { width: this._colWidth(invPos, 2), align: 'center' });
            doc.text('Conteo Físico', physicalX, y + 2, { width: this._colWidth(invPos, 3), align: 'center' });
            y += 32;
          }

          if (index % 2 === 0) {
            doc.rect(50, y - 3, 495, 24).fill('#fafafa');
          }
          doc.moveTo(50, y + 21).lineTo(545, y + 21).lineWidth(0.5).strokeColor('#e4e4e7').stroke();

          doc.fillColor('#27272a').fontSize(9).font('Helvetica');
          doc.text(p.name, nameX + 5, y + 2, { width: this._colWidth(invPos, 0) });

          doc.fillColor('#52525b').fontSize(9);
          doc.text(p.category, categoryX + 5, y + 2, { width: this._colWidth(invPos, 1) });

          doc.fillColor('#27272a').fontSize(9).font('Helvetica-Bold');
          doc.text(p.current_stock.toString(), theoreticalX, y + 2, { width: this._colWidth(invPos, 2), align: 'center' });
          doc.font('Helvetica');

          doc.moveTo(physicalX, y + 10).lineTo(physicalX + 65, y + 10).lineWidth(0.5).strokeColor('#a1a1aa').stroke();
          y += 27;
        });

        y += 20;
        doc.moveTo(50, y).lineTo(545, y).lineWidth(1).strokeColor('#e4e4e7').stroke();
        y += 24;

        doc.rect(50, y, 495, 28).fill('#f8f4ff');
        doc.rect(50, y, 6, 28).fill('#8b5cf6');
        doc.fillColor('#18181b').fontSize(12).font('Helvetica-Bold');
        doc.text('Firma', 66, y + 7);
        y += 50;

        doc.fillColor('#18181b').fontSize(10).font('Helvetica-Bold');
        doc.text('Dr. Isabel Parada', 50, y);
        doc.fillColor('#71717a').fontSize(9).font('Helvetica');
        doc.text('Propietaria - La Casona Eventos', 50, y + 14);
        doc.moveTo(50, y + 40).lineTo(240, y + 40).lineWidth(1).strokeColor('#18181b').stroke();
        doc.fillColor('#a1a1aa').fontSize(8).font('Helvetica-Oblique');
        doc.text('Firma de la Propietaria', 50, y + 44);

        this._drawFooter(doc);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async _generateBasePDF(title, headers, dataRows, columnWidths, columnAlignments, showSignature = true) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        let y = this._drawHeader(doc, title);
        y += 12;

        y = this._drawTableHeader(doc, headers, columnWidths, y, columnAlignments);

        dataRows.forEach((row, index) => {
          if (y > 740) {
            this._drawFooter(doc);
            doc.addPage();
            y = this._drawCompactHeader(doc, title);
            y += 8;
            y = this._drawTableHeader(doc, headers, columnWidths, y, columnAlignments);
          }
          this._drawTableRow(doc, row, columnWidths, y, columnAlignments, index);
          y += 27;
        });

        if (showSignature) {
          y += 20;
          if (y > 700) {
            this._drawFooter(doc);
            doc.addPage();
            y = this._drawCompactHeader(doc, title);
            y += 20;
          }
          doc.moveTo(50, y).lineTo(545, y).lineWidth(1).strokeColor('#e4e4e7').stroke();
          y += 24;

          doc.rect(50, y, 495, 28).fill('#f8f4ff');
          doc.rect(50, y, 6, 28).fill('#8b5cf6');
          doc.fillColor('#18181b').fontSize(12).font('Helvetica-Bold');
          doc.text('Firma', 66, y + 7);
          y += 50;

          doc.fillColor('#18181b').fontSize(10).font('Helvetica-Bold');
          doc.text('Dr. Isabel Parada', 50, y);
          doc.fillColor('#71717a').fontSize(9).font('Helvetica');
          doc.text('Propietaria - La Casona Eventos', 50, y + 14);
          doc.moveTo(50, y + 40).lineTo(240, y + 40).lineWidth(1).strokeColor('#18181b').stroke();
          doc.fillColor('#a1a1aa').fontSize(8).font('Helvetica-Oblique');
          doc.text('Firma de la Propietaria', 50, y + 44);
        }

        this._drawFooter(doc);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateClientsPDF() {
    const clients = await Client.findAll({ order: [['name', 'ASC']] });
    const headers = ['Nombre Completo', 'Documento', 'Teléfono', 'Dirección'];
    const dataRows = clients.map(c => [
      `${c.name} ${c.last_name}`,
      c.doc_id,
      c.phone || 'N/A',
      c.direction || 'N/A'
    ]);
    const columnWidths = [50, 220, 320, 430];
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
      `#${String(s.sale_id).padStart(5, '0')}`,
      `$${Number(s.total).toFixed(2)}`,
      new Date(s.create_at).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
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
    const columnWidths = [50, 190, 290, 400, 480];
    return this._generateBasePDF('Reporte de Empleados', headers, dataRows, columnWidths);
  }

  generateEventContractPDF(event) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        let y = this._drawHeader(doc, `Evento #${String(event.event_id).padStart(4, '0')}`, 'Confirmación y Detalles de Evento');
        y += 16;

        // Client Details Section
        doc.rect(50, y, 495, 28).fill('#f8f4ff');
        doc.rect(50, y, 6, 28).fill('#8b5cf6');
        doc.fillColor('#18181b').fontSize(12).font('Helvetica-Bold');
        doc.text('Datos del Cliente', 66, y + 7);
        y += 40;

        doc.fontSize(9).font('Helvetica').fillColor('#27272a');
        const client = event.Client || {};
        const leftLabel = [
          { label: 'Nombre', value: `${client.name || ''} ${client.last_name || ''}`.trim() || 'N/A' },
          { label: 'Teléfono', value: client.phone || 'N/A' }
        ];
        const rightLabel = [
          { label: 'Documento', value: client.doc_id || 'N/A' },
          { label: 'Correo', value: client.email || 'N/A' }
        ];

        leftLabel.forEach((item, i) => {
          doc.fillColor('#71717a').font('Helvetica-Bold');
          doc.text(item.label, 50, y + (i * 18));
          doc.fillColor('#27272a').font('Helvetica');
          doc.text(item.value, 130, y + (i * 18));
        });
        rightLabel.forEach((item, i) => {
          doc.fillColor('#71717a').font('Helvetica-Bold');
          doc.text(item.label, 300, y + (i * 18));
          doc.fillColor('#27272a').font('Helvetica');
          doc.text(item.value, 380, y + (i * 18));
        });

        y += 56;
        doc.moveTo(50, y).lineTo(545, y).lineWidth(1).strokeColor('#e4e4e7').stroke();
        y += 16;

        // Event Details Section
        doc.rect(50, y, 495, 28).fill('#f8f4ff');
        doc.rect(50, y, 6, 28).fill('#8b5cf6');
        doc.fillColor('#18181b').fontSize(12).font('Helvetica-Bold');
        doc.text('Detalles del Evento', 66, y + 7);
        y += 40;

        let startDate = 'N/A', endDate = 'N/A';
        try {
            startDate = new Date(event.start_date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
            endDate = new Date(event.end_date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
        } catch(e) {}

        const venueName = event.Venues && event.Venues.length > 0
          ? event.Venues.map(v => v.name).join(', ')
          : (event.Venue?.name || 'N/A');

        const eventFields = [
          { label: 'Tipo de Evento', value: event.type_event || 'N/A' },
          { label: 'Salón(es)', value: venueName },
          { label: 'Inicio', value: startDate },
          { label: 'Fin', value: endDate },
        ];

        eventFields.forEach((field, i) => {
          const col = i % 2 === 0 ? 50 : 300;
          const row = Math.floor(i / 2);
          doc.fillColor('#71717a').font('Helvetica-Bold').fontSize(9);
          doc.text(field.label, col, y + (row * 18));
          doc.fillColor('#27272a').font('Helvetica').fontSize(9);
          doc.text(field.value, col + 100, y + (row * 18), { width: 150 });
        });

        y += 56;
        doc.moveTo(50, y).lineTo(545, y).lineWidth(1).strokeColor('#e4e4e7').stroke();
        y += 16;

        // Services Section
        doc.rect(50, y, 495, 28).fill('#f8f4ff');
        doc.rect(50, y, 6, 28).fill('#8b5cf6');
        doc.fillColor('#18181b').fontSize(12).font('Helvetica-Bold');
        doc.text('Servicios Contratados', 66, y + 7);
        y += 40;

        if (event.EventItems && event.EventItems.length > 0) {
          event.EventItems.forEach((item, idx) => {
            const svc = item.ServiceExternal;
            if (idx % 2 === 0) {
              doc.rect(50, y - 2, 495, 22).fill('#fafafa');
            }
            doc.circle(58, y + 6, 2.5).fill('#8b5cf6');
            doc.fillColor('#27272a').fontSize(9).font('Helvetica');
            doc.text(`${svc?.name || 'Servicio'}`, 68, y + 1);
            doc.fillColor('#71717a').fontSize(8);
            doc.text(svc?.service_type || 'General', 68, y + 12);
            y += 24;
          });
        } else {
          doc.fontSize(9).font('Helvetica-Oblique').fillColor('#71717a');
          doc.text('No hay servicios externos contratados para este evento.', 50, y);
          y += 22;
        }

        y += 20;
        doc.moveTo(50, y).lineTo(545, y).lineWidth(1).strokeColor('#e4e4e7').stroke();
        y += 24;

        // Signature Section
        doc.rect(50, y, 495, 28).fill('#f8f4ff');
        doc.rect(50, y, 6, 28).fill('#8b5cf6');
        doc.fillColor('#18181b').fontSize(12).font('Helvetica-Bold');
        doc.text('Firmas', 66, y + 7);
        y += 50;

        // Left: Owner signature
        doc.fillColor('#18181b').fontSize(10).font('Helvetica-Bold');
        doc.text('Dr. Isabel Parada', 50, y);
        doc.fillColor('#71717a').fontSize(9).font('Helvetica');
        doc.text('Propietaria - La Casona Eventos', 50, y + 14);

        doc.moveTo(50, y + 40).lineTo(240, y + 40).lineWidth(1).strokeColor('#18181b').stroke();
        doc.fillColor('#a1a1aa').fontSize(8).font('Helvetica-Oblique');
        doc.text('Firma de la Propietaria', 50, y + 44);

        // Right: Client signature
        doc.fillColor('#18181b').fontSize(10).font('Helvetica-Bold');
        doc.text(`${event.Client?.name || 'Cliente'} ${event.Client?.last_name || ''}`.trim(), 310, y);
        doc.fillColor('#71717a').fontSize(9).font('Helvetica');
        doc.text('Cliente', 310, y + 14);

        doc.moveTo(310, y + 40).lineTo(500, y + 40).lineWidth(1).strokeColor('#18181b').stroke();
        doc.fillColor('#a1a1aa').fontSize(8).font('Helvetica-Oblique');
        doc.text('Firma del Cliente', 310, y + 44);

        this._drawFooter(doc);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ReportService();
