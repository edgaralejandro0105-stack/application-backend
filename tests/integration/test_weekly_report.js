require('dotenv').config();
const cronService = require('../../src/services/cron.service');
const { sequelize } = require('../../src/models');

async function forceWeeklyReport() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    
    console.log('🚀 Forzando la ejecución del reporte semanal (fuera de horario)...');
    // Llamamos directamente a la función que hace el cron los Lunes
    await cronService.generateWeeklyReport();
    
    console.log('✅ Ejecución finalizada. Revisa tu correo de Gmail.');
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

forceWeeklyReport();
