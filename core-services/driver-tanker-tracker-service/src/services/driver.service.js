const { LIVE_STATE_TTL_SECONDS, STALE_DRIVER_THRESHOLD_SECONDS } = require('../config/env');
const { getRedis } = require('../store/redis.store');
const { isValidLatLng, normalizeIsoTimestamp, toFiniteNumber } = require('../utils/validate');

function driverKey(driverId) {
  return `driver:${driverId}:live`;
}

function socketKey(socketId) {
  return `socket:${socketId}:driver`;
}

function activeDriversSetKey() {
  return 'drivers:active';
}

function nowIso() {
  return new Date().toISOString();
}

function sanitizeDestination(payload = {}, existing = {}) {
  const originalLat = toFiniteNumber(payload.originalDeliveryLat, toFiniteNumber(payload.deliveryLat, existing.originalDeliveryLat ?? null));
  const originalLng = toFiniteNumber(payload.originalDeliveryLng, toFiniteNumber(payload.deliveryLng, existing.originalDeliveryLng ?? null));
  const activeLat = toFiniteNumber(payload.activeDeliveryLat, toFiniteNumber(payload.deliveryLat, existing.activeDeliveryLat ?? originalLat));
  const activeLng = toFiniteNumber(payload.activeDeliveryLng, toFiniteNumber(payload.deliveryLng, existing.activeDeliveryLng ?? originalLng));

  return {
    originalDeliveryLat: isValidLatLng(originalLat, originalLng) ? originalLat : null,
    originalDeliveryLng: isValidLatLng(originalLat, originalLng) ? originalLng : null,
    activeDeliveryLat: isValidLatLng(activeLat, activeLng) ? activeLat : null,
    activeDeliveryLng: isValidLatLng(activeLat, activeLng) ? activeLng : null,
    destinationVersion: Number.isInteger(Number(payload.destinationVersion)) ? Number(payload.destinationVersion) : Number(existing.destinationVersion || 1),
    destinationChangedAt: normalizeIsoTimestamp(payload.destinationChangedAt || existing.destinationChangedAt || nowIso()),
    destinationReason: String(payload.destinationReason || existing.destinationReason || 'trip_start').trim(),
  };
}

async function getDriver(driverId) {
  const redis = getRedis();
  const raw = await redis.get(driverKey(driverId));
  return raw ? JSON.parse(raw) : null;
}

async function saveDriverState(state, socketId) {
  const redis = getRedis();
  const pipeline = redis.pipeline();
  pipeline.set(driverKey(state.driverId), JSON.stringify(state), 'EX', LIVE_STATE_TTL_SECONDS);
  pipeline.set(socketKey(socketId), state.driverId, 'EX', LIVE_STATE_TTL_SECONDS);
  pipeline.sadd(activeDriversSetKey(), state.driverId);
  await pipeline.exec();
  return state;
}

async function removeDriverState(driverId, socketId) {
  const redis = getRedis();
  const pipeline = redis.pipeline();
  pipeline.del(driverKey(driverId));
  if (socketId) pipeline.del(socketKey(socketId));
  pipeline.srem(activeDriversSetKey(), driverId);
  await pipeline.exec();
}

async function getDriverIdFromSocket(socketId) {
  const redis = getRedis();
  return redis.get(socketKey(socketId));
}

async function getAllDrivers() {
  const redis = getRedis();
  const ids = await redis.smembers(activeDriversSetKey());
  if (!ids.length) return [];

  const values = await redis.mget(ids.map((id) => driverKey(id)));
  const cutoffMs = Date.now() - STALE_DRIVER_THRESHOLD_SECONDS * 1000;

  return values
    .filter(Boolean)
    .map((raw) => JSON.parse(raw))
    .filter((item) => {
      const ts = new Date(item.lastSeen || item.updatedAt || item.timestamp || 0).getTime();
      return Number.isFinite(ts) && ts >= cutoffMs;
    })
    .sort((a, b) => String(a.driverId).localeCompare(String(b.driverId)));
}

async function markDriverOnline(socketId, payload = {}) {
  const driverId = String(payload.driverId || '').trim();
  const tripId = String(payload.tripId || '').trim();

  if (!driverId) throw new Error('driverId is required in driver-online');
  if (!tripId) throw new Error('tripId is required in driver-online');

  const existing = (await getDriver(driverId)) || {};
  const destination = sanitizeDestination(payload, existing);

  const state = {
    driverId,
    tripId,
    lat: existing.lat ?? null,
    lng: existing.lng ?? null,
    accuracy: existing.accuracy ?? 0,
    speed: existing.speed ?? 0,
    bearing: existing.bearing ?? 0,
    provider: existing.provider ?? 'unknown',
    timestamp: normalizeIsoTimestamp(payload.timestamp || existing.timestamp || nowIso()),
    isOnline: true,
    status: 'ONLINE',
    socketId,
    updatedAt: nowIso(),
    lastSeen: nowIso(),
    ...destination,
  };

  return saveDriverState(state, socketId);
}

async function updateDriverLocation(socketId, payload = {}) {
  const fallbackDriverId = await getDriverIdFromSocket(socketId);
  const driverId = String(payload.driverId || fallbackDriverId || '').trim();
  const tripId = String(payload.tripId || '').trim();
  if (!driverId) throw new Error('driverId is required in driver-location');
  if (!tripId) throw new Error('tripId is required in driver-location');

  const lat = toFiniteNumber(payload.lat);
  const lng = toFiniteNumber(payload.lng);
  if (!isValidLatLng(lat, lng)) throw new Error('Valid lat and lng are required');

  const existing = (await getDriver(driverId)) || {};
  const destination = sanitizeDestination(payload, existing);

  const state = {
    driverId,
    tripId,
    lat,
    lng,
    accuracy: toFiniteNumber(payload.accuracy, 0),
    speed: toFiniteNumber(payload.speed, 0),
    bearing: toFiniteNumber(payload.bearing, toFiniteNumber(payload.heading, 0)),
    provider: String(payload.provider || 'unknown'),
    timestamp: normalizeIsoTimestamp(payload.timestamp || nowIso()),
    isOnline: true,
    status: 'TRACKING',
    socketId,
    updatedAt: nowIso(),
    lastSeen: nowIso(),
    ...destination,
  };

  return saveDriverState(state, socketId);
}

async function updateDestination(socketId, payload = {}) {
  const fallbackDriverId = await getDriverIdFromSocket(socketId);
  const driverId = String(payload.driverId || fallbackDriverId || '').trim();
  const tripId = String(payload.tripId || '').trim();
  if (!driverId) throw new Error('driverId is required in trip-destination-updated');
  if (!tripId) throw new Error('tripId is required in trip-destination-updated');

  const existing = await getDriver(driverId);
  if (!existing) throw new Error('Driver is not online');
  if (String(existing.tripId) !== tripId) throw new Error('Trip mismatch for destination update');

  const destination = sanitizeDestination(payload, existing);
  if (!isValidLatLng(destination.activeDeliveryLat, destination.activeDeliveryLng)) {
    throw new Error('Valid active destination lat and lng are required');
  }

  const state = {
    ...existing,
    ...destination,
    isOnline: true,
    status: 'DESTINATION_UPDATED',
    socketId,
    updatedAt: nowIso(),
    lastSeen: nowIso(),
  };

  return saveDriverState(state, socketId);
}

async function markDriverOffline(socketId, payload = {}) {
  const fallbackDriverId = await getDriverIdFromSocket(socketId);
  const driverId = String(payload.driverId || fallbackDriverId || '').trim();
  if (!driverId) return null;

  const existing = await getDriver(driverId);
  if (!existing) {
    await removeDriverState(driverId, socketId);
    return null;
  }

  const state = {
    ...existing,
    isOnline: false,
    status: 'OFFLINE',
    updatedAt: nowIso(),
    lastSeen: nowIso(),
    timestamp: normalizeIsoTimestamp(payload.timestamp || nowIso()),
  };

  await removeDriverState(driverId, socketId);
  return state;
}

async function handleSocketDisconnect(socketId) {
  return markDriverOffline(socketId, {});
}

module.exports = {
  getAllDrivers,
  getDriver,
  getDriverIdFromSocket,
  markDriverOnline,
  updateDriverLocation,
  updateDestination,
  markDriverOffline,
  handleSocketDisconnect,
};
