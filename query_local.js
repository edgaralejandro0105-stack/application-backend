const { Sequelize } = require('sequelize');
const db = new Sequelize('postgres://postgres:admin123@localhost:5432/lacasona', { logging: false });
db.query('SELECT product_id, name, current_stock, unit_price FROM products LIMIT 5;')
  .then(res => console.log(res[0]))
  .catch(console.error)
  .finally(() => process.exit());
