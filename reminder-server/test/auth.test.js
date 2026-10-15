const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { startDb, stopDb, clearDb, api, createUser } = require('./helpers');

describe('auth', () => {
  before(startDb);
  after(stopDb);
  beforeEach(clearDb);

  it('registers and returns a token without the password', async () => {
    const res = await api().post('/api/auth/register').send({ username: 'rachel', password: 'secret123', fullName: 'רחל' });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.fullName, 'רחל');
    assert.strictEqual(res.body.user.password, undefined);
    assert.strictEqual(res.body.user.audioData, undefined);
  });

  it('rejects short passwords, bad usernames and duplicates', async () => {
    assert.strictEqual((await api().post('/api/auth/register').send({ username: 'rachel', password: '123' })).status, 400);
    assert.strictEqual((await api().post('/api/auth/register').send({ username: 'a', password: 'secret123' })).status, 400);
    await createUser({ username: 'rachel' });
    assert.strictEqual((await api().post('/api/auth/register').send({ username: 'rachel', password: 'secret123' })).status, 409);
  });

  it('logs in with the right password only', async () => {
    await createUser({ username: 'david', password: 'secret123' });
    const ok = await api().post('/api/auth/login').send({ username: 'david', password: 'secret123' });
    assert.strictEqual(ok.status, 200);
    assert.ok(ok.body.token);
    const bad = await api().post('/api/auth/login').send({ username: 'david', password: 'wrong' });
    assert.strictEqual(bad.status, 401);
    const missing = await api().post('/api/auth/login').send({ username: 'nobody', password: 'secret123' });
    assert.strictEqual(missing.status, 401);
  });

  it('protects private routes', async () => {
    assert.strictEqual((await api().get('/api/reminders')).status, 401);
    assert.strictEqual((await api().get('/api/users/me')).status, 401);
    assert.strictEqual((await api().get('/api/users/me').set('Authorization', 'Bearer not-a-token')).status, 401);
  });

  it('reports health', async () => {
    const res = await api().get('/api/health');
    assert.deepStrictEqual(res.body, { ok: true, db: true });
  });
});
