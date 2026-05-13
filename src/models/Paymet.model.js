const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Sale = require('./Sale.model');
const Event = require('./Event.model');

const Payment = db.define('Payment', {
  payment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sale_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Puede ser nulo si el pago es directo a un evento
    references: { model: Sale, key: 'sale_id' }
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Event, key: 'event_id' }
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  method: {
    type: DataTypes.ENUM('Zelle', 'Efectivo', 'Transferencia', 'Punto de Venta', 'Pago Móvil'),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'payments',
  timestamps: false
});

Payment.belongsTo(Sale, { foreignKey: 'sale_id' });
Payment.belongsTo(Event, { foreignKey: 'event_id' });

module.exports = Payment;