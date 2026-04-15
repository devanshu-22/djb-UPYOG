require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 8080),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '*',
  SOCKET_PATH: process.env.SOCKET_PATH || '/driver-tanker-tracker-service/socket.io',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  LIVE_STATE_TTL_SECONDS: Number(process.env.LIVE_STATE_TTL_SECONDS || 180),
  STALE_DRIVER_THRESHOLD_SECONDS: Number(process.env.STALE_DRIVER_THRESHOLD_SECONDS || 60),
  JWT_SECRET: process.env.JWT_SECRET || '',
  REQUIRE_SOCKET_AUTH: String(process.env.REQUIRE_SOCKET_AUTH || 'false').toLowerCase() === 'true',
};
