const Venue = require('../models/Venue.model');

exports.createVenue = async (req, res) => {
  try {
    const venue = await Venue.create(req.body);
    res.status(201).json({ message: 'Lugar creado correctamente', data: venue });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.findAll();
    res.status(200).json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findByPk(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: 'Lugar no encontrado' });
    }
    res.status(200).json(venue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findByPk(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: 'Lugar no encontrado' });
    }
    await venue.update(req.body);
    res.status(200).json({ message: 'Lugar actualizado correctamente', data: venue });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findByPk(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: 'Lugar no encontrado' });
    }
    await venue.destroy();
    res.status(200).json({ message: 'Lugar eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
