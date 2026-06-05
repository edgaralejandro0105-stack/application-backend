const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  const isGmail = process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail');
  const transportConfig = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true para 465 (SSL), false para 587 (TLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  if (isGmail) {
    transportConfig.service = 'gmail';
  }

  transporter = nodemailer.createTransport(transportConfig);
  return transporter;
}

class EmailService {
  /**
   * Compila una plantilla Handlebars
   * @param {string} templateName Nombre de la plantilla (sin .hbs)
   * @param {Object} context Variables para inyectar
   */
  compileTemplate(templateName, context) {
    const basePath = path.join(__dirname, '../templates/base.hbs');
    const templatePath = path.join(__dirname, `../templates/${templateName}.hbs`);
    
    const baseSource = fs.readFileSync(basePath, 'utf8');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    
    // Agregamos variables globales
    const fullContext = {
      ...context,
      currentYear: new Date().getFullYear()
    };

    // Compilamos la plantilla específica
    const compiledTemplate = handlebars.compile(templateSource)(fullContext);
    
    // Inyectamos la plantilla compilada en el body de base.hbs
    const compiledBase = handlebars.compile(baseSource)({
      body: compiledTemplate,
      currentYear: fullContext.currentYear
    });

    return compiledBase;
  }

  async sendEmail({ to, subject, templateName, context, html, attachments = [] }) {
    try {
      const mailTransporter = await getTransporter();
      
      let finalHtml = html;
      if (templateName && context) {
        finalHtml = this.compileTemplate(templateName, context);
      }

      const defaultAttachments = [
        {
          filename: 'logo2.png',
          path: path.join(__dirname, '../templates/logo2.png'),
          cid: 'logo_casona'
        }
      ];

      const mailOptions = {
        from: '"La Casona Eventos" <no-reply@lacasona.com>',
        to,
        subject,
        html: finalHtml,
        attachments: [...defaultAttachments, ...attachments]
      };

      const info = await mailTransporter.sendMail(mailOptions);
      console.log('Correo enviado: %s', info.messageId);
      
      return info;
    } catch (error) {
      console.error('Error al enviar el correo: ', error);
      throw new Error('Error al enviar el correo');
    }
  }
}

module.exports = new EmailService();
