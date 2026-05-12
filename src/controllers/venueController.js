const venueService = require('../services/venue.service');
const catchAsync = require('../utils/catchAsync');

exports.getAllVenues = catchAsync(async (req, res) => {
  const result = await venueService.getAllVenues(req.query);
  res.status(200).json(result);
});

exports.createVenue = catchAsync(async (req, res) => {
  const venue = await venueService.createVenue(req.body);
  res.status(201).json({ message: 'Salón creado correctamente', data: venue });
});

exports.getVenueById = catchAsync(async (req, res) => {
  const venue = await venueService.getVenueById(req.params.id);
  res.status(200).json(venue);
});

exports.updateVenue = catchAsync(async (req, res) => {
  const venue = await venueService.updateVenue(req.params.id, req.body);
  res.status(200).json({ message: 'Salón actualizado correctamente', data: venue });
});

exports.deleteVenue = catchAsync(async (req, res) => {
  await venueService.deleteVenue(req.params.id);
  res.status(200).json({ message: 'Salón eliminado correctamente' });
});