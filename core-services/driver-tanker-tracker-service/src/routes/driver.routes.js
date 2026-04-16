const express = require('express');
const controller = require('../controllers/driver.controller');

const router = express.Router();

router.get('/health', controller.healthCheck);
router.get('/drivers', controller.getDrivers);
router.get('/drivers/:driverId', controller.getDriverById);

module.exports = router;
