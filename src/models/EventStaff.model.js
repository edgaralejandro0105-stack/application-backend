const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Event = require('./Event.model');
const Employee = require('./Employee.model');

const EventStaff = db.define('EventStaff', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  event_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Event,
      key: 'event_id'
    },
    allowNull: false
  },
  employee_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Employee,
      key: 'employee_id'
    },
    allowNull: false
  },
  role_in_event: {
    type: DataTypes.STRING(50), 
    // Ejemplo: 'Mesero Principal', 'Coordinador de Luces', 'Seguridad Puerta A'
    allowNull: true
  }
}, {
  tableName: 'event_staff',
  timestamps: false
});

// Relaciones para poder hacer Consultas (Joins) fácilmente
EventStaff.belongsTo(Event, { foreignKey: 'event_id' });
EventStaff.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = EventStaff;