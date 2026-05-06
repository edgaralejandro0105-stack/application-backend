const Event = require('../models/Event.model');
const Client = require('../models/Client.model');
const Venue = require('../models/Venue.model');

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        { model: Client, attributes: ['name', 'last_name', 'doc_id', 'phone'] }, // Trae datos específicos del cliente
        { model: Venue, attributes: ['name'] } // Trae solo el nombre del salón
      ]
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const newEvent = await Event.create(req.body);
    res.status(201).json({ message: 'Evento creado correctamente', data: newEvent });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: Client, attributes: ['name', 'last_name', 'doc_id', 'phone'] },
        { model: Venue, attributes: ['name'] }
      ]
    });
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    await event.update(req.body);
    res.status(200).json({ message: "Evento actualizado correctamente", data: event });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    await event.destroy();
    res.status(200).json({ message: "Evento eliminado de la base de datos" });
  } catch (error) {
    res.status(500).json({ message: 'Error interno al intentar eliminar el evento.', error: error.message });
  }
};