const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const registerTrackingSocket = require("./sockets/tracking.socket");
const { PORT, CLIENT_ORIGIN } = require("./config/env");
const { log } = require("./utils/logger");

const server = http.createServer(app);

const io = new Server(server, {
  path: "/driver-tanker-tracker-service",
  cors: {
    origin: CLIENT_ORIGIN === "*" ? true : CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

registerTrackingSocket(io);

server.listen(PORT, "0.0.0.0", () => {
  log(`Server running on http://127.0.0.1:${PORT}`);
});