const cron = require('node-cron');
const { Op } = require('sequelize');
const emailService = require('./email.service');
const { Product, Sale, User, Venue, ServiceExternal, Client, Employee, Event, Provider, sequelize } = require('../models');

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

    cron.schedule('0 2 * * *', async () => {
      console.log('⏰ Ejecutando limpieza de la papelera...');
      await this.cleanupTrash();
    }, {
      scheduled: true,
      timezone: "America/Bogota"
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
      const adminEmail = (process.env.ADMIN_EMAIL || process.env.SMTP_USER || '').trim();

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

  async cleanupTrash() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const whereCondition = {
        is_active: false,
        deleted_at: {
          [Op.lt]: thirtyDaysAgo
        }
      };

      const deletedUsers = await User.destroy({ where: whereCondition });
      const deletedVenues = await Venue.destroy({ where: whereCondition });
      const deletedServices = await ServiceExternal.destroy({ where: whereCondition });
      const deletedClients = await Client.destroy({ where: whereCondition, force: true });
      const deletedEmployees = await Employee.destroy({ where: whereCondition, force: true });
      const deletedEvents = await Event.destroy({ where: whereCondition });
      const deletedProducts = await Product.destroy({ where: whereCondition, force: true });
      const deletedProviders = await Provider.destroy({ where: whereCondition, force: true });

      console.log(`[Cron] Cleanup completo. Eliminados permanentemente: ${deletedUsers} Usuarios, ${deletedVenues} Salones, ${deletedServices} Servicios, ${deletedClients} Clientes, ${deletedEmployees} Empleados, ${deletedEvents} Eventos, ${deletedProducts} Productos, ${deletedProviders} Proveedores.`);
    } catch (error) {
      console.error('[Cron] Error limpiando la papelera:', error);
    }
  }
}

module.exports = new CronService();
