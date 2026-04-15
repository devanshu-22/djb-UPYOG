const driverService = require('../services/driver.service');

async function healthCheck(req, res) {
  res.json({
    success: true,
    message: 'Driver tanker tracker is running',
    uptimeSeconds: Math.round(process.uptime()),
  });
}

async function getDrivers(req, res, next) {
  try {
    const data = await driverService.getAllDrivers();
    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function getDriverById(req, res, next) {
  try {
    const driver = await driverService.getDriver(req.params.driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    return res.json({ success: true, data: driver });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  healthCheck,
  getDrivers,
  getDriverById,
};
