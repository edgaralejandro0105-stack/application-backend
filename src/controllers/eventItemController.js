const EventItem = require('../models/EventItem.model');
const Product = require('../models/Product.model');

exports.createEventItem = async (req, res) => {
  try {
    const eventItem = await EventItem.create(req.body);
    res.status(201).json({ message: 'Ítem de evento creado', data: eventItem });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllEventItems = async (req, res) => {
  try {
    const items = await EventItem.findAll({ include: [Product] });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventItemById = async (req, res) => {
  try {
    const item = await EventItem.findByPk(req.params.id, { include: [Product] });
    if (!item) {
      return res.status(404).json({ message: 'Ítem de evento no encontrado' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getItemsByEvent = async (req, res) => {
  try {
    const items = await EventItem.findAll({
      where: { event_id: req.params.eventId },
      include: [Product]
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEventItem = async (req, res) => {
  try {
    const item = await EventItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Ítem de evento no encontrado' });
    }
    await item.update(req.body);
    res.status(200).json({ message: 'Ítem de evento actualizado', data: item });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEventItem = async (req, res) => {
  try {
    const item = await EventItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Ítem de evento no encontrado' });
    }
    await item.destroy();
    res.status(200).json({ message: 'Ítem de evento eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
