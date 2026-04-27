const EventStaff = require('../models/EventStaff.model');
const Employee = require('../models/Employee.model');

exports.createEventStaff = async (req, res) => {
  try {
    const staff = await EventStaff.create(req.body);
    res.status(201).json({ message: 'Asignación de staff creada', data: staff });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllEventStaff = async (req, res) => {
  try {
    const staff = await EventStaff.findAll({ include: [Employee] });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventStaffById = async (req, res) => {
  try {
    const staff = await EventStaff.findByPk(req.params.id, { include: [Employee] });
    if (!staff) {
      return res.status(404).json({ message: 'Asignación de staff no encontrada' });
    }
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStaffByEvent = async (req, res) => {
  try {
    const staff = await EventStaff.findAll({
      where: { event_id: req.params.eventId },
      include: [Employee]
    });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEventStaff = async (req, res) => {
  try {
    const staff = await EventStaff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Asignación de staff no encontrada' });
    }
    await staff.update(req.body);
    res.status(200).json({ message: 'Asignación de staff actualizada', data: staff });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEventStaff = async (req, res) => {
  try {
    const staff = await EventStaff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Asignación de staff no encontrada' });
    }
    await staff.destroy();
    res.status(200).json({ message: 'Asignación de staff eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
