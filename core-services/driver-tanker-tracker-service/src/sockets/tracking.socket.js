const driverService = require("../services/driver.service");
const { log, error } = require("../utils/logger");

function registerTrackingSocket(io) {
  io.on("connection", (socket) => {
    log(`Socket connected: ${socket.id}`);

    socket.on("admin-join", () => {
      socket.join("admins");
      log(`Admin joined: ${socket.id}`);
      socket.emit("drivers-snapshot", driverService.getAllDrivers());
    });

    socket.on("driver-online", (data = {}) => {
      try {
        const driverId = String(data.driverId || "").trim();

        if (!driverId) {
          socket.emit("tracking-error", {
            message: "driverId is required in driver-online",
          });
          return;
        }

        socket.join(`driver:${driverId}`);

        const updatedDriver = driverService.markDriverOnline(driverId, socket.id);

        io.to("admins").emit("driver-status", updatedDriver);
        log(`Driver online: ${driverId}`);
      } catch (err) {
        error("driver-online error:", err.message);
        socket.emit("tracking-error", { message: err.message });
      }
    });

    socket.on("driver-location", (data = {}) => {
      try {
        const updatedDriver = driverService.updateDriverLocation(socket.id, data);
        io.to("admins").emit("driver-location-update", updatedDriver);
      } catch (err) {
        error("driver-location error:", err.message);
        socket.emit("tracking-error", { message: err.message });
      }
    });

    socket.on("driver-offline", (data = {}) => {
      try {
        const driverId = String(
          data.driverId || driverService.getDriverIdFromSocket(socket.id) || ""
        ).trim();

        if (!driverId) return;

        const updatedDriver = driverService.markDriverOffline(
          driverId,
          data.timestamp
        );

        if (updatedDriver) {
          io.to("admins").emit("driver-status", updatedDriver);
          log(`Driver offline: ${driverId}`);
        }
      } catch (err) {
        error("driver-offline error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      try {
        const updatedDriver = driverService.handleSocketDisconnect(socket.id);

        if (updatedDriver) {
          io.to("admins").emit("driver-status", updatedDriver);
          log(`Driver disconnected: ${updatedDriver.driverId}`);
        } else {
          log(`Socket disconnected: ${socket.id}`);
        }
      } catch (err) {
        error("disconnect error:", err.message);
      }
    });
  });
}

module.exports = registerTrackingSocket;