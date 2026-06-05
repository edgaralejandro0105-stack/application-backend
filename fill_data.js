const { Sequelize } = require('sequelize');
const db = new Sequelize('postgresql://neondb_owner:npg_rQwjt7eH8Ouz@ep-round-boat-a4nzinjh-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require', { logging: false });

async function fillData() {
  try {
    // 1. Obtener los productos actuales con su stock
    const [products] = await db.query(`SELECT product_id, current_stock FROM products WHERE current_stock > 0`);
    const [users] = await db.query(`SELECT user_id FROM users LIMIT 1`);
    const adminId = users.length > 0 ? users[0].user_id : null;

    // 2. Llenar inventory_bar para reflejar el stock actual (Movimientos de Entrada)
    if (adminId) {
      for (const p of products) {
        // Verificar si ya existe un movimiento de entrada inicial para no duplicar
        const [existingMov] = await db.query(`SELECT inventory_id FROM inventory_bar WHERE product_id = ?`, { replacements: [p.product_id] });
        if (existingMov.length === 0) {
          await db.query(
            `INSERT INTO inventory_bar (product_id, user_id, movement_type, quantity, unit_price, date) VALUES (?, ?, 'Entry', ?, 0.00, NOW())`,
            { replacements: [p.product_id, adminId, p.current_stock] }
          );
        }
      }
      console.log("✅ inventory_bar llenado con movimientos de entrada iniciales.");
    }

    // 3. Llenar event_items con data de ejemplo
    const [events] = await db.query(`SELECT event_id FROM events LIMIT 2`);
    const [services] = await db.query(`SELECT service_id FROM services_external LIMIT 2`);
    
    if (events.length >= 2 && services.length >= 2) {
      // Evento 1 con Servicio 1
      const [existingEventItem1] = await db.query(`SELECT item_id FROM event_items WHERE event_id = ? AND service_id = ?`, { replacements: [events[0].event_id, services[0].service_id] });
      if (existingEventItem1.length === 0) {
        await db.query(`INSERT INTO event_items (event_id, service_id, final_price) VALUES (?, ?, 150.00)`, { replacements: [events[0].event_id, services[0].service_id] });
      }

      // Evento 2 con Servicio 2
      const [existingEventItem2] = await db.query(`SELECT item_id FROM event_items WHERE event_id = ? AND service_id = ?`, { replacements: [events[1].event_id, services[1].service_id] });
      if (existingEventItem2.length === 0) {
        await db.query(`INSERT INTO event_items (event_id, service_id, final_price) VALUES (?, ?, 250.00)`, { replacements: [events[1].event_id, services[1].service_id] });
      }
      console.log("✅ event_items llenado con servicios de ejemplo.");
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

fillData();
