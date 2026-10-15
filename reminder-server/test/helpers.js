// Test setup: an in-memory MongoDB per test file, so real data is never touched.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongo;

async function startDb() {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}

async function stopDb() {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
}

async function clearDb() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

const api = () => request(app);

let counter = 0;
// Registers a fresh user and returns { token, user, auth } where auth is the header value.
async function createUser(overrides = {}) {
  counter += 1;
  const res = await api()
    .post('/api/auth/register')
    .send({ username: `user${counter}`, password: 'secret123', ...overrides });
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { ...res.body, auth: `Bearer ${res.body.token}` };
}

const minutesFromNow = (m) => new Date(Date.now() + m * 60000).toISOString();

module.exports = { startDb, stopDb, clearDb, api, createUser, minutesFromNow };
