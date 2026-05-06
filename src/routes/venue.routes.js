const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');

router.get('/', venueController.getAllVenues);

module.exports = router;