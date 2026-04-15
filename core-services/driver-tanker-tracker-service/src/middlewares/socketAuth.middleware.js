const jwt = require('jsonwebtoken');
const { JWT_SECRET, REQUIRE_SOCKET_AUTH } = require('../config/env');

function parseBearer(value = '') {
  if (!value || typeof value !== 'string') return '';
  return value.startsWith('Bearer ') ? value.slice(7).trim() : value.trim();
}

function socketAuth(socket, next) {
  if (!REQUIRE_SOCKET_AUTH) {
    return next();
  }

  try {
    if (!JWT_SECRET) {
      return next(new Error('Socket auth enabled but JWT_SECRET is missing'));
    }

    const headerToken = parseBearer(socket.handshake.headers?.authorization || '');
    const authToken = parseBearer(socket.handshake.auth?.token || '');
    const token = headerToken || authToken;

    if (!token) {
      return next(new Error('Missing socket auth token'));
    }

    socket.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return next(new Error('Invalid socket auth token'));
  }
}

module.exports = socketAuth;
