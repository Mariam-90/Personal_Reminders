const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { startDb, stopDb, clearDb, api, createUser } = require('./helpers');

describe('profile', () => {
  let me;

  before(startDb);
  after(stopDb);
  beforeEach(async () => {
    await clearDb();
    me = await createUser();
  });

  it('updates details and drops empty info rows', async () => {
    const res = await api()
      .put('/api/users/me')
      .set('Authorization', me.auth)
      .send({ fullName: 'רחל כהן', caregiverName: 'דני', caregiverPhone: '050-1234567', infoItems: [{ label: 'רופא', value: 'ד"ר לוי' }, { label: '', value: '' }] });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.fullName, 'רחל כהן');
    assert.deepStrictEqual(res.body.infoItems, [{ label: 'רופא', value: 'ד"ר לוי' }]);

    const me2 = await api().get('/api/users/me').set('Authorization', me.auth);
    assert.strictEqual(me2.body.caregiverName, 'דני');
  });

  it('only accepts known sounds', async () => {
    assert.strictEqual((await api().put('/api/users/me').set('Authorization', me.auth).send({ soundName: 'blobbell.wav' })).body.soundName, 'blobbell.wav');
    assert.strictEqual((await api().put('/api/users/me').set('Authorization', me.auth).send({ soundName: '../../etc/passwd' })).status, 400);
    assert.strictEqual((await api().put('/api/users/me').set('Authorization', me.auth).send({ soundName: 'custom' })).status, 400);
  });

  it('stores and serves a personal sound', async () => {
    const up = await api()
      .post('/api/users/me/sound')
      .set('Authorization', me.auth)
      .attach('sound', Buffer.from('RIFF....WAVE'), { filename: 's.wav', contentType: 'audio/wav' });
    assert.strictEqual(up.status, 200);
    assert.strictEqual(up.body.soundName, 'custom');
    assert.strictEqual(up.body.hasCustomSound, true);

    const get = await api().get('/api/users/me/sound').set('Authorization', me.auth);
    assert.strictEqual(get.status, 200);
    assert.match(get.headers['content-type'], /audio\/wav/);
  });
});
