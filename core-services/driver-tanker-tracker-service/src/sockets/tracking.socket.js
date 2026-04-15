const driverService = require('../services/driver.service');
const { info, warn, error } = require('../utils/logger');

function registerTrackingSocket(io) {
  io.on('connection', (socket) => {
   // info('socket_connected', { socketId: socket.id, ip: socket.handshake.address });

    socket.on('admin-join', async () => {
      try {
        socket.join('admins');
        const snapshot = await driverService.getAllDrivers();
        socket.emit('drivers-snapshot', snapshot);
       // info('admin_joined', { socketId: socket.id, driverCount: snapshot.length });
      } catch (err) {
        error('admin_join_failed', { socketId: socket.id, message: err.message });
        socket.emit('tracking-error', { message: err.message });
      }
    });

    socket.on('driver-online', async (data = {}, ack) => {
      try {
        const state = await driverService.markDriverOnline(socket.id, data);
        socket.join(`driver:${state.driverId}`);
        io.to('admins').emit('driver-status', state);
        if (typeof ack === 'function') ack({ success: true, driverId: state.driverId });
       // info('driver_online', { socketId: socket.id, driverId: state.driverId, tripId: state.tripId });
      } catch (err) {
        error('driver_online_failed', { socketId: socket.id, message: err.message });
        socket.emit('tracking-error', { message: err.message });
        if (typeof ack === 'function') ack({ success: false, message: err.message });
      }
    });

    socket.on('driver-location', async (data = {}, ack) => {
      try {
        const state = await driverService.updateDriverLocation(socket.id, data);
        io.to('admins').emit('driver-location-update', state);
        if (typeof ack === 'function') ack({ success: true, driverId: state.driverId, tripId: state.tripId });
      } catch (err) {
        error('driver_location_failed', { socketId: socket.id, message: err.message });
        socket.emit('tracking-error', { message: err.message });
        if (typeof ack === 'function') ack({ success: false, message: err.message });
      }
    });

    socket.on('trip-destination-updated', async (data = {}, ack) => {
      try {
        const state = await driverService.updateDestination(socket.id, data);
        io.to('admins').emit('driver-destination-update', state);
        socket.to(`driver:${state.driverId}`).emit('driver-destination-update', state);
        if (typeof ack === 'function') ack({ success: true, driverId: state.driverId, tripId: state.tripId });
        //info('driver_destination_updated', { socketId: socket.id, driverId: state.driverId, tripId: state.tripId });
      } catch (err) {
        error('driver_destination_update_failed', { socketId: socket.id, message: err.message });
        socket.emit('tracking-error', { message: err.message });
        if (typeof ack === 'function') ack({ success: false, message: err.message });
      }
    });

    socket.on('driver-offline', async (data = {}, ack) => {
      try {
        const state = await driverService.markDriverOffline(socket.id, data);
        if (state) {
          io.to('admins').emit('driver-status', state);
       //   info('driver_offline', { socketId: socket.id, driverId: state.driverId, tripId: state.tripId });
        }
        if (typeof ack === 'function') ack({ success: true });
      } catch (err) {
        error('driver_offline_failed', { socketId: socket.id, message: err.message });
        if (typeof ack === 'function') ack({ success: false, message: err.message });
      }
    });

    socket.on('disconnect', async (reason) => {
      try {
        const state = await driverService.handleSocketDisconnect(socket.id);
        if (state) {
          io.to('admins').emit('driver-status', state);
        //  warn('socket_disconnected_driver_offline', { socketId: socket.id, reason, driverId: state.driverId, tripId: state.tripId });
        } else {
          info('socket_disconnected', { socketId: socket.id, reason });
        }
      } catch (err) {
        error('socket_disconnect_failed', { socketId: socket.id, message: err.message });
      }
    });
  });
}

module.exports = registerTrackingSocket;
