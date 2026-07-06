const { Client, Event, sequelize } = require('./src/models');

async function injectData() {
  try {
    await sequelize.authenticate();
    console.log('DB Conectada');

    // 1. Crear o actualizar cliente
    const [client, created] = await Client.findOrCreate({
      where: { email: 'rinconfrancisco10122005@gmail.com' },
      defaults: {
        name: 'Francisco',
        last_name: 'Rincón',
        doc_id: '31434151',
        phone: '04141234567'
      }
    });

    if (!created) {
      // Si ya existía, actualizamos sus datos para que coincida con la clave F31434151
      await client.update({
        name: 'Francisco',
        doc_id: '31434151'
      });
      console.log('Cliente actualizado');
    } else {
      console.log('Cliente creado');
    }

    // 2. Crear un evento de prueba si no tiene
    const events = await Event.findAll({ where: { client_id: client.client_id } });
    
    if (events.length === 0) {
      // Create a dummy event tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 1);
      nextWeek.setHours(tomorrow.getHours() + 6);

      await Event.create({
        client_id: client.client_id,
        type_event: 'Boda',
        guests: 150,
        status: 'Confirmed',
        start_date: tomorrow,
        end_date: nextWeek
      });
      console.log('Evento de prueba creado');
    } else {
      console.log('El cliente ya tiene eventos. No se crearon nuevos.');
    }

    console.log('✅ Inyección completada exitosamente.');
    process.exit(0);
  } catch (err) {
    console.error('Error inyectando datos:', err);
    process.exit(1);
  }
}

injectData();
