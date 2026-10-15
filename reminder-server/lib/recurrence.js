const Reminder = require('../models/Reminder');

function addInterval(date, recurrence) {
  const next = new Date(date);
  switch (recurrence) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      return null;
  }
  return next;
}

// First occurrence strictly after `after`, keeping the original time of day.
function nextOccurrence(from, recurrence, after = new Date()) {
  let next = addInterval(from, recurrence);
  while (next && next <= after) {
    next = addInterval(next, recurrence);
  }
  return next;
}

/**
 * Creates the next occurrence of a recurring reminder exactly once.
 * The atomic flag flip on hasNewReminder makes concurrent calls safe.
 */
async function scheduleNext(reminder) {
  if (!reminder || reminder.recurrence === 'none') return null;

  const claimed = await Reminder.findOneAndUpdate(
    { _id: reminder._id, hasNewReminder: { $ne: true } },
    { $set: { hasNewReminder: true } },
    { new: true }
  );
  if (!claimed) return null;

  const executionDate = nextOccurrence(claimed.executionDate, claimed.recurrence);
  return Reminder.create({
    task: claimed.task,
    category: claimed.category,
    executionDate,
    userId: claimed.userId,
    recurrence: claimed.recurrence,
    recordedTaskAudioFileName: claimed.recordedTaskAudioFileName,
  });
}

// Recurring reminders whose time has passed get their next occurrence, even if missed.
async function rollOverDue(userId) {
  const due = await Reminder.find({
    userId,
    recurrence: { $ne: 'none' },
    hasNewReminder: { $ne: true },
    executionDate: { $lte: new Date() },
  });
  await Promise.all(due.map(scheduleNext));
}

module.exports = { nextOccurrence, scheduleNext, rollOverDue };
