const { Sequelize } = require('sequelize');
const db = new Sequelize('postgresql://neondb_owner:npg_rQwjt7eH8Ouz@ep-round-boat-a4nzinjh-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require', { logging: false });

const data = [
  { name: "Ron Ventarrón", stock: 5, unit: "0,70lt" },
  { name: "Ron Canaima", stock: 7, unit: "0,70lt" },
  { name: "Ron Santa Teresa", stock: 5, unit: "0,75lt" },
  { name: "Ron Cacique", stock: 2, unit: "0,75lt" },
  { name: "Ron Diplomático", stock: 1, unit: "0,70lt" },
  { name: "Ron Bronco", stock: 3, unit: "1lt" },
  { name: "Ron Pampero", stock: 1, unit: "0,70lt" },
  { name: "Ron Bodega", stock: 3, unit: "0,70lt" },
  { name: "Ron 5 estrellas", stock: 2, unit: "0,70lt" },
  { name: "Aguardiente Antioqueño", stock: 3, unit: "0,75lt" },
  { name: "Anís Cartujo", stock: 2, unit: "1lt" },
  { name: "Anís Bandera", stock: 5, unit: "1lt" },
  { name: "Whisky Red label Jonny Walker", stock: 2, unit: "0,75lt" },
  { name: "Whisky Black Label Jonny Walker", stock: 1, unit: "0,75lt" },
  { name: "Whisky Chivas Regal", stock: 2, unit: "0,75lt" },
  { name: "Whisky Old Parr", stock: 2, unit: "0,75lt" },
  { name: "Whisky Buchanan's", stock: 2, unit: "0,75lt" },
  { name: "Ginebra Gordon (limón)", stock: 2, unit: "0,75lt" },
  { name: "Vodka Bajo 0 (mora azul)", stock: 1, unit: "0,70lt" },
  { name: "Vodka Bajo 0 (maracuyá)", stock: 1, unit: "0,70lt" }
];

async function updateInventory() {
  try {
    for (const item of data) {
      let searchName = item.name;
      if (searchName === "Ron Ventarrón") searchName = "Ron Ventarr";
      else if (searchName === "Ron Diplomático") searchName = "Ron Diplom";
      else if (searchName === "Aguardiente Antioqueño") searchName = "Antioque";
      else if (searchName === "Anís Cartujo") searchName = "Cartujo";
      else if (searchName === "Anís Bandera") searchName = "Bandera";
      else if (searchName === "Vodka Bajo 0 (mora azul)") searchName = "mora azul";
      else if (searchName === "Vodka Bajo 0 (maracuyá)") searchName = "maracuy";

      let [results] = await db.query(
        `UPDATE products SET current_stock = ?, measurement_unit = ? WHERE name ILIKE ? RETURNING *`,
        { replacements: [item.stock, item.unit, '%' + searchName + '%'] }
      );
      
      if (!results || results.length === 0) {
        let category = "Bar";
        if (item.name.toLowerCase().includes("ron")) category = "Ron";
        else if (item.name.toLowerCase().includes("whisky")) category = "Whisky";
        else if (item.name.toLowerCase().includes("vodka")) category = "Vodka";
        else if (item.name.toLowerCase().includes("ginebra")) category = "Ginebra";
        else if (item.name.toLowerCase().includes("anís")) category = "Anís";
        else if (item.name.toLowerCase().includes("aguardiente")) category = "Aguardiente";

        await db.query(
          `INSERT INTO products (name, category, measurement_unit, current_stock, min_stock, unit_price, create_at, update_at) VALUES (?, ?, ?, ?, 0, 0.00, NOW(), NOW())`,
          { replacements: [item.name, category, item.unit, item.stock] }
        );
        console.log(`[INSERTADO] ${item.name}`);
      } else {
        console.log(`[ACTUALIZADO] ${item.name}`);
      }
    }
    console.log("¡Proceso completado!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

updateInventory();
