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
    allowNull: true, // Puede ser nulo si es una venta rápida de bar
    references: { model: Event, key: 'event_id' }
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  pay_method: {
    type: DataTypes.ENUM('Cash', 'Card', 'Transfer'),
    allowNull: false
  },
  payment_date: {
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