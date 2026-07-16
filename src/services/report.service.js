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

        // ─── HEADER ───
        const logoPath = path.join(__dirname, '../templates/logo2.png');
        try { doc.image(logoPath, 450, 20, { fit: [80, 80], align: 'right' }); } catch (e) {}

        doc.rect(50, 18, 495, 5).fill('#8b5cf6');

        doc.fillColor('#18181b').fontSize(20).font('Helvetica-Bold');
        doc.text('LA CASONA EVENTS', 50, 40);
        doc.fillColor('#52525b').fontSize(9).font('Helvetica');
        doc.text('Sistema Integrado de Gestión Empresarial', 50, 63);
        doc.fillColor('#71717a').fontSize(8);
        doc.text('RIF: J-XXXXXXXX-X  |  Tel: +58 412-XXX-XXXX  |  Email: lacasona@email.com', 50, 77);

        doc.moveTo(50, 92).lineTo(545, 92).lineWidth(1).strokeColor('#d4d4d8').stroke();

        // ─── TITLE ───
        doc.fillColor('#8b5cf6').fontSize(16).font('Helvetica-Bold');
        doc.text('CONTRATO DE PRESTACIÓN DE SERVICIOS', 50, 108, { align: 'center' });

        const now = new Date();
        const contractDate = now.toLocaleDateString('es-ES', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        doc.fillColor('#18181b').fontSize(10).font('Helvetica');
        doc.text(`Contrato N°: EVT-${String(event.event_id).padStart(4, '0')}-${now.getFullYear()}`, 50, 132);
        doc.text(`Fecha de emisión: ${contractDate}`, 350, 132, { align: 'right' });

        let y = 162;
        doc.moveTo(50, y).lineTo(545, y).lineWidth(0.5).strokeColor('#d4d4d8').stroke();
        y += 24;

        // ─── COMPARECIENTES ───
        doc.rect(50, y, 495, 28).fill('#f4f0ff');
        doc.rect(50, y, 5, 28).fill('#8b5cf6');
        doc.fillColor('#18181b').fontSize(10).font('Helvetica-Bold');
        doc.text('COMPARECIENTES', 66, y + 8);
        y += 42;

        const cliente = event.Client || {};
        const clienteName = `${cliente.name || ''} ${cliente.last_name || ''}`.trim() || 'N/A';

        doc.fontSize(9).font('Helvetica').fillColor('#27272a');
        doc.text('Constituyen las partes intervinientes en el presente contrato, quienes se identifican a continuación:', 50, y, { width: 495, align: 'justify' });
        y += 22;

        // Box for each party
        const boxW = 230;
        doc.rect(50, y, boxW, 55).lineWidth(1).strokeColor('#d4d4d8');
        doc.rect(50, y, boxW, 18).fill('#f4f0ff');
        doc.fillColor('#8b5cf6').fontSize(8).font('Helvetica-Bold');
        doc.text('EL CONTRATANTE', 55, y + 4);
        doc.fillColor('#27272a').fontSize(8).font('Helvetica');
        doc.text(`${clienteName}`, 55, y + 24);
        doc.text(`C.I. / RIF: ${cliente.doc_id || 'N/A'}`, 55, y + 36);
        doc.text(`Tel: ${cliente.phone || 'N/A'}`, 55, y + 46);

        const boxX = 310;
        doc.rect(boxX, y, boxW, 55).lineWidth(1).strokeColor('#d4d4d8');
        doc.rect(boxX, y, boxW, 18).fill('#f4f0ff');
        doc.fillColor('#8b5cf6').fontSize(8).font('Helvetica-Bold');
        doc.text('EL CONTRATISTA', boxX + 5, y + 4);
        doc.fillColor('#27272a').fontSize(8).font('Helvetica');
        doc.text('LA CASONA EVENTS, C.A.', boxX + 5, y + 24);
        doc.text('Representante: Dr. Isabel Parada', boxX + 5, y + 36);
        doc.text('Propietaria', boxX + 5, y + 46);

        y += 72;
        doc.moveTo(50, y).lineTo(545, y).lineWidth(0.5).strokeColor('#d4d4d8').stroke();
        y += 20;

        // ─── CLAUSULAS ───
        const drawClausula = (num, title, text, startY) => {
          if (startY > 700) {
            this._drawFooter(doc);
            doc.addPage();
            startY = 50;
          }
          doc.fillColor('#8b5cf6').fontSize(9.5).font('Helvetica-Bold');
          doc.text(`CLÁUSULA ${num}. ${title}`, 50, startY);
          startY += 16;
          doc.fillColor('#27272a').fontSize(8.5).font('Helvetica');
          doc.text(text, 50, startY, { width: 495, align: 'justify', lineGap: 3 });
          const h = doc.heightOfString(text, { width: 495, align: 'justify', lineGap: 3 });
          startY += h + 18;
          return startY;
        };

        let startDate = 'N/A', endDate = 'N/A';
        try {
          startDate = new Date(event.start_date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
          endDate = new Date(event.end_date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
        } catch(e) {}

        const venueName = event.Venues && event.Venues.length > 0
          ? event.Venues.map(v => v.name).join(', ')
          : (event.Venue?.name || 'N/A');

        const servicesText = event.EventItems && event.EventItems.length > 0
          ? event.EventItems.map(item => {
              const svc = item.ServiceExternal;
              return `• ${svc?.name || 'Servicio'} (${svc?.service_type || 'General'})`;
            }).join('\n')
          : 'No se contrataron servicios externos adicionales.';

        y = drawClausula('PRIMERA', 'OBJETO DEL CONTRATO',
          'El presente contrato tiene por objeto la prestación de servicios integrales de organización, ' +
          'coordinación y realización del evento social descrito en la Cláusula Segunda, por parte de ' +
          'LA CASONA EVENTS, C.A. (en adelante "EL CONTRATISTA") al cliente arriba identificado ' +
          '(en adelante "EL CONTRATANTE"), quien solicita dichos servicios de manera voluntaria y formal.', y);

        y = drawClausula('SEGUNDA', 'DESCRIPCIÓN DEL EVENTO',
          `EL CONTRATISTA se compromete a realizar el evento descrito a continuación:\n\n` +
          `  Tipo de Evento: ${event.type_event || 'N/A'}\n` +
          `  Salón(es): ${venueName}\n` +
          `  Fecha y Hora de Inicio: ${startDate}\n` +
          `  Fecha y Hora de Fin: ${endDate}\n` +
          `  Número de Invitados: ${event.guests || 'No especificado'}\n\n` +
          `El evento se llevará a cabo en las instalaciones de LA CASONA, ubicadas en la ciudad de Barquisimeto, Estado Lara.`, y);

        y = drawClausula('TERCERA', 'SERVICIOS CONTRATADOS',
          'Los servicios adicionales contratados para el evento son los siguientes:\n\n' + servicesText + '\n\n' +
          'Cualquier servicio adicional no contemplado en esta cláusula deberá ser solicitado por escrito ' +
          'y estará sujeto a disponibilidad y costos adicionales.', y);

        y = drawClausula('CUARTA', 'OBLIGACIONES DEL CONTRATANTE',
          'Son obligaciones de EL CONTRATANTE:\n\n' +
          '1. Pagar el monto total acordado por los servicios en la forma y plazos establecidos.\n' +
          '2. Proporcionar la información necesaria para la organización del evento.\n' +
          '3. Cumplir con las normas de conducta y horarios establecidos en las instalaciones.\n' +
          '4. Notificar cualquier cambio en los detalles del evento con al menos 72 horas de antelación.\n' +
          '5. Responder por cualquier daño material causado a las instalaciones durante el evento.', y);

        y = drawClausula('QUINTA', 'OBLIGACIONES DEL CONTRATISTA',
          'Son obligaciones de EL CONTRATISTA:\n\n' +
          '1. Prestar los servicios contratados con la mayor diligencia y profesionalismo.\n' +
          '2. Proveer el personal necesario para la correcta ejecución del evento.\n' +
          '3. Mantener las instalaciones en óptimas condiciones de limpieza y operatividad.\n' +
          '4. Cumplir con los horarios acordados para el inicio y finalización del evento.\n' +
          '5. Responder por la calidad de los servicios ofrecidos.', y);

        y = drawClausula('SEXTA', 'CONDICIONES DE PAGO',
          'EL CONTRATANTE se compromete a cancelar la totalidad de los servicios contratados de acuerdo a ' +
          'las siguientes condiciones:\n\n' +
          '• El monto total será facturado al momento de la confirmación del evento.\n' +
          '• Se podrán realizar pagos parciales según lo acordado con la administración.\n' +
          '• El pago total debe completarse antes de la fecha del evento.\n' +
          '• En caso de mora, se aplicarán los intereses establecidos en la legislación vigente.', y);

        y = drawClausula('SÉPTIMA', 'POLÍTICA DE CANCELACIÓN',
          'En caso de cancelación del evento por parte de EL CONTRATANTE:\n\n' +
          '• Cancelación con más de 15 días de anticipación: reembolso del 80% del monto pagado.\n' +
          '• Cancelación entre 7 y 15 días de anticipación: reembolso del 50% del monto pagado.\n' +
          '• Cancelación con menos de 7 días de anticipación: no hay reembolso.\n' +
          '• LA CASONA se reserva el derecho de cancelar el evento por caso fortuito o fuerza mayor, ' +
          'realizando el reembolso total de los montos pagados.', y);

        y = drawClausula('OCTAVA', 'ACEPTACIÓN',
          'Las partes declaran que han leído y comprenden el contenido del presente contrato, y lo aceptan ' +
          'en todas sus partes. En señal de conformidad, firman el presente documento en la ciudad de ' +
          `Barquisimeto, a los ${now.getDate()} días del mes de ${now.toLocaleString('es-ES', { month: 'long' })} ` +
          `del año ${now.getFullYear()}.`, y);

        // ─── SIGNATURES ───
        y += 10;
        if (y > 680) {
          this._drawFooter(doc);
          doc.addPage();
          y = 50;
        }

        doc.moveTo(50, y).lineTo(545, y).lineWidth(0.5).strokeColor('#d4d4d8').stroke();
        y += 16;

        doc.rect(50, y, 495, 26).fill('#f4f0ff');
        doc.rect(50, y, 5, 26).fill('#8b5cf6');
        doc.fillColor('#18181b').fontSize(10).font('Helvetica-Bold');
        doc.text('FIRMAS', 66, y + 7);
        y += 50;

        // Left: Owner
        doc.fillColor('#18181b').fontSize(10).font('Helvetica-Bold');
        doc.text('Dr. Isabel Parada', 55, y);
        doc.fillColor('#71717a').fontSize(8).font('Helvetica');
        doc.text('Propietaria - LA CASONA EVENTS, C.A.', 55, y + 14);
        doc.fillColor('#a1a1aa').fontSize(8).font('Helvetica');
        doc.text('C.I. / RIF: Representante Legal', 55, y + 26);
        doc.moveTo(55, y + 48).lineTo(260, y + 48).lineWidth(1).strokeColor('#18181b').stroke();
        doc.fillColor('#71717a').fontSize(8).font('Helvetica-Oblique');
        doc.text('Firma de la Propietaria', 55, y + 52);

        // Right: Client
        doc.fillColor('#18181b').fontSize(10).font('Helvetica-Bold');
        doc.text(clienteName, 310, y);
        doc.fillColor('#71717a').fontSize(8).font('Helvetica');
        doc.text('Cliente - CONTRATANTE', 310, y + 14);
        doc.fillColor('#a1a1aa').fontSize(8).font('Helvetica');
        doc.text(`C.I. / RIF: ${cliente.doc_id || 'N/A'}`, 310, y + 26);
        doc.moveTo(310, y + 48).lineTo(515, y + 48).lineWidth(1).strokeColor('#18181b').stroke();
        doc.fillColor('#71717a').fontSize(8).font('Helvetica-Oblique');
        doc.text('Firma del Cliente', 310, y + 52);

        this._drawFooter(doc);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ReportService();
