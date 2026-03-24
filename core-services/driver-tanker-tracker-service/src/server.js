const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const registerTrackingSocket = require("./sockets/tracking.socket");
const { PORT, CLIENT_ORIGIN } = require("./config/env");
const { log } = require("./utils/logger");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN === "*" ? true : CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});
const waterTankerNamespace = io.of("/driver-tanker-tracker-service/driver-track");

registerTrackingSocket(waterTankerNamespace);

server.listen(PORT, "0.0.0.0", () => {
  log(`Server running on`);
});