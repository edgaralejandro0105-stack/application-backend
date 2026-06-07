require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const emailService = require('./services/email.service');

async function testSMTP() {
  console.log('=== Iniciando prueba de SMTP Backend ===');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('User:', process.env.SMTP_USER);
  console.log('Pass:', process.env.SMTP_PASS ? 'Configurado (longitud: ' + process.env.SMTP_PASS.length + ')' : 'No configurado');
  console.log('Admin Email:', process.env.ADMIN_EMAIL);
  
  const testEmailDest = 'javierpinto10122005@gmail.com';
  
  try {
    console.log(`\n1. Enviando correo de prueba al cliente (${testEmailDest})...`);
    const info = await emailService.sendEmail({
      to: testEmailDest,
      subject: 'Prueba de Conexión SMTP - La Casona (Cliente)',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
          <h2 style="color: #4CAF50;">La Casona Eventos</h2>
          <p>Este es un correo de prueba enviado desde el <strong>servidor backend</strong> para verificar la conexión SMTP con Gmail.</p>
          <p>Si has recibido este correo, significa que el backend puede comunicarse con el servidor de correos correctamente.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <small style="color: #777;">La Casona Eventos © 2026</small>
        </div>
      `
    });
    console.log('✅ Correo enviado con éxito!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error al enviar correo de prueba SMTP:', error);
  }
}

testSMTP();
