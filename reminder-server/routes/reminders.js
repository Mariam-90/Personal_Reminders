const express = require('express');
const mongoose = require('mongoose');
const Reminder = require('../models/Reminder');
const { requireAuth } = require('../middleware/auth');
const { diskUpload, removeUpload } = require('../middleware/upload');
const { scheduleNext, rollOverDue } = require('../lib/recurrence');
const { apiError } = require('../lib/errors');

const router = express.Router();
router.use(requireAuth);

const MAX_SNOOZE_MINUTES = 24 * 60;

// Validates the editable fields; returns { data } or { error: <error code> }.
function parseReminderInput(body, { partial = false } = {}) {
  const data = {};

  if (body.task !== undefined || !partial) {
    const task = String(body.task || '').trim();
    if (!task) return { error: 'taskRequired' };
    if (task.length > 200) return { error: 'taskTooLong' };
    data.task = task;
  }

  if (body.executionDate !== undefined || !partial) {
    const executionDate = new Date(body.executionDate);
    if (!body.executionDate || Number.isNaN(executionDate.getTime())) {
      return { error: 'dateInvalid' };
    }
    data.executionDate = executionDate;
  }

  if (body.recurrence !== undefined) {
    if (!Reminder.RECURRENCES.includes(body.recurrence)) return { error: 'recurrenceInvalid' };
    data.recurrence = body.recurrence;
  }

  if (body.category !== undefined) {
    data.category = String(body.category).slice(0, 30) || 'general';
  }

  return { data };
}

// Loads a reminder that belongs to the logged-in user, or answers 404.
async function findOwned(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json(apiError('reminderNotFound'));
    return null;
  }
  const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.userId });
  if (!reminder) res.status(404).json(apiError('reminderNotFound'));
  return reminder;
}

router.get('/', async (req, res, next) => {
  try {
    await rollOverDue(req.userId);
    const reminders = await Reminder.find({ userId: req.userId }).sort({ executionDate: 1 });
    res.json(reminders);
  } catch (err) {
    next(err);
  }
});

router.post('/', diskUpload.single('recording'), async (req, res, next) => {
  try {
    const { data, error } = parseReminderInput(req.body);
    if (error) {
      removeUpload(req.file?.filename);
      return res.status(400).json(apiError(error));
    }
    const reminder = await Reminder.create({
      ...data,
      userId: req.userId,
      recordedTaskAudioFileName: req.file ? req.file.filename : null,
    });
    return res.status(201).json(reminder);
  } catch (err) {
    removeUpload(req.file?.filename);
    return next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const reminder = await findOwned(req, res);
    if (!reminder) return undefined;

    const { data, error } = parseReminderInput(req.body, { partial: true });
    if (error) return res.status(400).json(apiError(error));

    Object.assign(reminder, data);
    if (data.executionDate) reminder.snoozeUntil = null;
    await reminder.save();
    return res.json(reminder);
  } catch (err) {
    return next(err);
  }
});

router.post('/:id/complete', async (req, res, next) => {
  try {
    const reminder = await findOwned(req, res);
    if (!reminder) return undefined;

    if (!reminder.isCompleted) {
      reminder.isCompleted = true;
      reminder.completionDate = new Date();
      reminder.snoozeUntil = null;
      await reminder.save();
    }
    const nextReminder = await scheduleNext(reminder);
    return res.json({ reminder, next: nextReminder });
  } catch (err) {
    return next(err);
  }
});

router.post('/:id/undo', async (req, res, next) => {
  try {
    const reminder = await findOwned(req, res);
    if (!reminder) return undefined;
    reminder.isCompleted = false;
    reminder.completionDate = undefined;
    await reminder.save();
    return res.json(reminder);
  } catch (err) {
    return next(err);
  }
});

router.post('/:id/snooze', async (req, res, next) => {
  try {
    const minutes = Number(req.body.minutes);
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > MAX_SNOOZE_MINUTES) {
      return res.status(400).json(apiError('snoozeInvalid'));
    }
    const reminder = await findOwned(req, res);
    if (!reminder) return undefined;

    reminder.snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);
    await reminder.save();
    return res.json(reminder);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const reminder = await findOwned(req, res);
    if (!reminder) return undefined;

    await reminder.deleteOne();
    // Recurring copies share the recording, so only delete the file when it is no longer used.
    const fileName = reminder.recordedTaskAudioFileName;
    if (fileName && !(await Reminder.exists({ recordedTaskAudioFileName: fileName }))) {
      removeUpload(fileName);
    }
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
