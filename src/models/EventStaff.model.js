const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Event = require('./Event.model');
const Employee = require('./Employee.model');

const EventStaff = db.define('EventStaff', {
  assignment_id: {
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
    allowNull: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Employee,
      key: 'employee_id'
    },
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT, 
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