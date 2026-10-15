const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { startDb, stopDb, clearDb, api, createUser, minutesFromNow } = require('./helpers');

describe('reminders', () => {
  let me;

  before(startDb);
  after(stopDb);
  beforeEach(async () => {
    await clearDb();
    me = await createUser();
  });

  const create = (body, auth = me.auth) => api().post('/api/reminders').set('Authorization', auth).send(body);

  it('creates and lists reminders sorted by time', async () => {
    await create({ task: 'ארוחת ערב', executionDate: minutesFromNow(120) });
    const res = await create({ task: 'לקחת תרופה', category: 'pill', executionDate: minutesFromNow(30) });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.category, 'pill');

    const list = await api().get('/api/reminders').set('Authorization', me.auth);
    assert.deepStrictEqual(list.body.map((r) => r.task), ['לקחת תרופה', 'ארוחת ערב']);
  });

  it('validates input', async () => {
    assert.strictEqual((await create({ task: '', executionDate: minutesFromNow(5) })).status, 400);
    assert.strictEqual((await create({ task: 'x', executionDate: 'not a date' })).status, 400);
    assert.strictEqual((await create({ task: 'x', executionDate: minutesFromNow(5), recurrence: 'hourly' })).status, 400);
  });

  it('edits, snoozes and deletes', async () => {
    const { body: r } = await create({ task: 'הליכה', executionDate: minutesFromNow(60) });

    const edited = await api().patch(`/api/reminders/${r._id}`).set('Authorization', me.auth).send({ task: 'הליכה בפארק' });
    assert.strictEqual(edited.body.task, 'הליכה בפארק');

    const snoozed = await api().post(`/api/reminders/${r._id}/snooze`).set('Authorization', me.auth).send({ minutes: 10 });
    assert.ok(snoozed.body.snoozeUntil);
    assert.strictEqual((await api().post(`/api/reminders/${r._id}/snooze`).set('Authorization', me.auth).send({ minutes: 0 })).status, 400);

    assert.strictEqual((await api().delete(`/api/reminders/${r._id}`).set('Authorization', me.auth)).status, 200);
    const list = await api().get('/api/reminders').set('Authorization', me.auth);
    assert.strictEqual(list.body.length, 0);
  });

  it('completes, undoes, and creates the next occurrence of a recurring reminder once', async () => {
    const { body: r } = await create({ task: 'כדור', executionDate: minutesFromNow(30), recurrence: 'daily' });

    const done = await api().post(`/api/reminders/${r._id}/complete`).set('Authorization', me.auth);
    assert.strictEqual(done.body.reminder.isCompleted, true);
    assert.ok(done.body.next, 'next occurrence created');
    const dayMs = 24 * 60 * 60 * 1000;
    assert.strictEqual(new Date(done.body.next.executionDate) - new Date(r.executionDate), dayMs);

    const again = await api().post(`/api/reminders/${r._id}/complete`).set('Authorization', me.auth);
    assert.strictEqual(again.body.next, null, 'no duplicate next occurrence');

    const undone = await api().post(`/api/reminders/${r._id}/undo`).set('Authorization', me.auth);
    assert.strictEqual(undone.body.isCompleted, false);

    const list = await api().get('/api/reminders').set('Authorization', me.auth);
    assert.strictEqual(list.body.length, 2);
  });

  it('rolls a missed recurring reminder forward when listing', async () => {
    await create({ task: 'מים', executionDate: minutesFromNow(-3 * 24 * 60), recurrence: 'daily' });
    const list = await api().get('/api/reminders').set('Authorization', me.auth);
    assert.strictEqual(list.body.length, 2);
    assert.ok(new Date(list.body[1].executionDate) > new Date(), 'next occurrence is in the future');
  });

  it("keeps users' reminders private", async () => {
    const { body: r } = await create({ task: 'סוד', executionDate: minutesFromNow(30) });
    const other = await createUser();

    assert.strictEqual((await api().get('/api/reminders').set('Authorization', other.auth)).body.length, 0);
    assert.strictEqual((await api().patch(`/api/reminders/${r._id}`).set('Authorization', other.auth).send({ task: 'x' })).status, 404);
    assert.strictEqual((await api().post(`/api/reminders/${r._id}/complete`).set('Authorization', other.auth)).status, 404);
    assert.strictEqual((await api().delete(`/api/reminders/${r._id}`).set('Authorization', other.auth)).status, 404);
    assert.strictEqual((await api().delete('/api/reminders/not-an-id').set('Authorization', other.auth)).status, 404);
  });

  it('accepts an audio recording and rejects other files', async () => {
    const ok = await api()
      .post('/api/reminders')
      .set('Authorization', me.auth)
      .field('task', 'הודעה קולית')
      .field('executionDate', minutesFromNow(30))
      .attach('recording', Buffer.from('fake audio'), { filename: 'r.webm', contentType: 'audio/webm' });
    assert.strictEqual(ok.status, 201);
    assert.match(ok.body.recordedTaskAudioFileName, /^[a-f0-9]{32}\.webm$/);

    const bad = await api()
      .post('/api/reminders')
      .set('Authorization', me.auth)
      .field('task', 'x')
      .field('executionDate', minutesFromNow(30))
      .attach('recording', Buffer.from('<script>'), { filename: 'x.html', contentType: 'text/html' });
    assert.strictEqual(bad.status, 400);

    await api().delete(`/api/reminders/${ok.body._id}`).set('Authorization', me.auth);
  });
});
