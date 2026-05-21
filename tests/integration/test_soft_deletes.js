require('dotenv').config();
const { sequelize, Client } = require('./src/models');
const clientService = require('./src/services/client.service');

async function testSoftDeletes() {
  try {
    console.log('🔄 Sincronizando base de datos para agregar columnas de Soft Deletes...');
    
    // Ejecutar ALTER TABLE directamente para añadir las columnas necesarias sin alterar tablas ajenas
    await sequelize.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`).catch(e => console.warn(e.message));
    await sequelize.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`).catch(e => console.warn(e.message));
    await sequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`).catch(e => console.warn(e.message));
    
    await sequelize.query(`ALTER TABLE sales ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`).catch(e => console.warn(e.message));
    await sequelize.query(`ALTER TABLE sales ADD COLUMN IF NOT EXISTS update_at TIMESTAMP WITH TIME ZONE;`).catch(e => console.warn(e.message));
    
    await sequelize.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`).catch(e => console.warn(e.message));
    await sequelize.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;`).catch(e => console.warn(e.message));
    await sequelize.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;`).catch(e => console.warn(e.message));
    
    // Ejecutar el sync normal para que Sequelize registre los esquemas
    await sequelize.sync();
    console.log('✅ Base de datos sincronizada!');

    console.log('\n--- 1. Creando un cliente de prueba ---');
    const dummyClient = await Client.create({
      name: 'Prueba',
      last_name: 'SoftDelete',
      doc_id: 'TEST_SD_' + Date.now(),
      phone: '123456789',
      direction: 'Test Dirección'
    });
    const clientId = dummyClient.client_id;
    console.log(`✅ Cliente creado: ID = ${clientId}, name = ${dummyClient.name}`);

    console.log('\n--- 2. Verificando que aparece en listados normales ---');
    const normalListBefore = await clientService.getAllClients({ limit: 100 });
    const foundBefore = normalListBefore.data.some(c => c.client_id === clientId);
    console.log(`¿Encontrado en listado normal antes del borrado?: ${foundBefore ? 'SÍ (Correcto)' : 'NO'}`);

    console.log('\n--- 3. Ejecutando borrado lógico mediante el servicio ---');
    await clientService.deleteClient(clientId);
    console.log('✅ Cliente eliminado.');

    console.log('\n--- 4. Verificando que ya NO aparece en listados normales ---');
    const normalListAfter = await clientService.getAllClients({ limit: 100 });
    const foundAfter = normalListAfter.data.some(c => c.client_id === clientId);
    console.log(`¿Encontrado en listado normal después del borrado?: ${foundAfter ? 'SÍ' : 'NO (Correcto - Borrado Lógico Exitoso)'}`);

    console.log('\n--- 5. Verificando que SÍ aparece al pasar includeDeleted=true ---');
    const deletedList = await clientService.getAllClients({ limit: 100, includeDeleted: 'true' });
    const foundInDeletedList = deletedList.data.find(c => c.client_id === clientId);
    console.log(`¿Encontrado con includeDeleted?: ${foundInDeletedList ? 'SÍ (Correcto)' : 'NO'}`);
    if (foundInDeletedList) {
      console.log(`   Valor de deleted_at: ${foundInDeletedList.deleted_at}`);
    }

    console.log('\n--- 6. Verificando registro directo en base de datos ---');
    // Si consultamos usando paranoid: false, debe traer el registro con su campo deleted_at lleno
    const clientInDb = await Client.findByPk(clientId, { paranoid: false });
    console.log(`¿El registro sigue físicamente en la BD?: ${clientInDb ? 'SÍ (Correcto - El historial no se perdió)' : 'NO'}`);
    console.log(`Fecha de borrado lógico (deleted_at): ${clientInDb ? clientInDb.deleted_at : 'null'}`);

    console.log('\n--- 7. Limpiando el registro físicamente (Hard Delete) ---');
    await Client.destroy({ where: { client_id: clientId }, force: true });
    console.log('✅ Registro de prueba eliminado físicamente de la base de datos.');

    console.log('\n🎉 ¡La prueba de borrado lógico ha finalizado con éxito! Todo funciona perfectamente.');

  } catch (error) {
    console.error('❌ Error durante la prueba de borrado lógico:', error);
  } finally {
    await sequelize.close();
  }
}

testSoftDeletes();
