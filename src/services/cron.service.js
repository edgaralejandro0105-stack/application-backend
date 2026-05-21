const cron = require('node-cron');
const { Op } = require('sequelize');
const emailService = require('./email.service');
const { Product, Sale, sequelize } = require('../models');
const moment = require('moment'); // O simplemente usar Vanilla JS Dates

class CronService {
  init() {
    console.log('⏳ Inicializando Cron Jobs...');
    
    // Tarea: Todos los lunes a las 8:00 AM
    // Sintaxis: 'Minuto Hora DíaDelMes Mes DíaDeLaSemana'
    // '0 8 * * 1' -> 8:00 AM todos los lunes
    cron.schedule('0 8 * * 1', async () => {
      console.log('⏰ Ejecutando Reporte Semanal Automático...');
      await this.generateWeeklyReport();
    }, {
      scheduled: true,
      timezone: "America/Bogota" // Ajusta a la zona horaria pertinente
    });

    console.log('✅ Cron Jobs programados correctamente.');
  }

  async generateWeeklyReport() {
    try {
      // 1. Obtener productos con bajo stock
      const lowStockProducts = await Product.findAll({
        where: {
          current_stock: {
            [Op.lte]: sequelize.col('min_stock')
          }
        },
        raw: true // Trae objetos JS puros, más fácil para Handlebars
      });

      // 2. Calcular el total de ventas de la semana anterior
      // Calculamos fechas usando JS Vanilla
      const today = new Date();
      const lastMonday = new Date(today);
      lastMonday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1) - 7);
      lastMonday.setHours(0, 0, 0, 0);

      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      lastSunday.setHours(23, 59, 59, 999);

      const sales = await Sale.findAll({
        where: {
          create_at: {
            [Op.between]: [lastMonday, lastSunday]
          }
        }
      });

      // Sumar el total de ventas (asumiendo que hay un campo total en Sale)
      const totalSalesAmount = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);

      // 3. Enviar correo al administrador
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER; // Puedes configurar ADMIN_EMAIL en .env

      await emailService.sendEmail({
        to: adminEmail,
        subject: '📊 Reporte Semanal La Casona - Ventas e Inventario',
        templateName: 'weekly-report',
        context: {
          totalSales: totalSalesAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }),
          lowStockProducts: lowStockProducts
        }
      });

      console.log('✅ Reporte semanal enviado al administrador con éxito.');
    } catch (error) {
      console.error('❌ Error generando el reporte semanal:', error);
    }
  }
}

module.exports = new CronService();
