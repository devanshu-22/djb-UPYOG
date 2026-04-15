const { error } = require('../utils/logger');

module.exports = function errorHandler(err, req, res, next) {
  error('http_error', { path: req.path, method: req.method, message: err.message });
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
