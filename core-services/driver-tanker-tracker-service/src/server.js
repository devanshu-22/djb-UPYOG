const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const registerTrackingSocket = require('./sockets/tracking.socket');
const socketAuth = require('./middlewares/socketAuth.middleware');
const { connectRedis, attachSocketAdapter } = require('./store/redis.store');
const { PORT, CLIENT_ORIGIN, SOCKET_PATH } = require('./config/env');
const { info, error } = require('./utils/logger');

async function startServer() {
  await connectRedis();

  const server = http.createServer(app);
  const io = new Server(server, {
    path: SOCKET_PATH,
    cors: {
      origin: CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN.split(',').map((item) => item.trim()),
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  attachSocketAdapter(io);
  io.use(socketAuth);
  registerTrackingSocket(io);

  server.listen(PORT, '0.0.0.0', () => {
    info('server_started', { port: PORT, socketPath: SOCKET_PATH });
  });
}

startServer().catch((err) => {
  error('server_start_failed', { message: err.message, stack: err.stack });
  process.exit(1);
});
