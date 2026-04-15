const Redis = require('ioredis');
const { createAdapter } = require('@socket.io/redis-adapter');
const { REDIS_URL } = require('../config/env');

let commandClient;
let pubClient;
let subClient;

async function connectRedis() {
  if (commandClient && pubClient && subClient) {
    return { commandClient, pubClient, subClient };
  }

  commandClient = new Redis(REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: true });
  pubClient = new Redis(REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: true });
  subClient = pubClient.duplicate();

  await Promise.all([
    new Promise((resolve, reject) => commandClient.once('ready', resolve).once('error', reject)),
    new Promise((resolve, reject) => pubClient.once('ready', resolve).once('error', reject)),
    new Promise((resolve, reject) => subClient.once('ready', resolve).once('error', reject)),
  ]);

  return { commandClient, pubClient, subClient };
}

function attachSocketAdapter(io) {
  if (!pubClient || !subClient) {
    throw new Error('Redis pub/sub clients are not connected');
  }
  io.adapter(createAdapter(pubClient, subClient));
}

function getRedis() {
  if (!commandClient) {
    throw new Error('Redis command client is not connected');
  }
  return commandClient;
}

module.exports = {
  connectRedis,
  attachSocketAdapter,
  getRedis,
};
