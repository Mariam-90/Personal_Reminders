import { addDays, dueTime, isSameDay, reminderStatus, startOfDay } from './time';

const ON_TIME_MINUTES = 30;

// Per-day done/missed counts for the last `days` days (oldest first).
export function dailyCounts(reminders, now = new Date(), days = 7) {
  const today = startOfDay(now);
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(today, i - (days - 1));
    const ofDay = reminders.filter((r) => isSameDay(dueTime(r), day));
    return {
      day,
      done: ofDay.filter((r) => r.isCompleted).length,
      missed: ofDay.filter((r) => reminderStatus(r, now) === 'missed').length,
    };
  });
}

export function summary(reminders, now = new Date()) {
  const week = dailyCounts(reminders, now, 7);
  const done = week.reduce((s, d) => s + d.done, 0);
  const missed = week.reduce((s, d) => s + d.missed, 0);
  const rate = done + missed ? Math.round((done / (done + missed)) * 100) : null;

  const since = addDays(startOfDay(now), -6);
  const completedThisWeek = reminders.filter((r) => r.isCompleted && r.completionDate && dueTime(r) >= since);
  const onTime = completedThisWeek.filter(
    (r) => new Date(r.completionDate) - new Date(r.executionDate) <= ON_TIME_MINUTES * 60000
  ).length;

  // Days in a row (up to today) with something done and nothing missed.
  let streak = 0;
  for (let i = 0; i < 60; i += 1) {
    const [d] = dailyCounts(reminders, addDays(now, -i), 1);
    const isToday = i === 0;
    if (d.missed > 0) break;
    if (d.done > 0) streak += 1;
    else if (!isToday) break;
  }

  return { week, done, missed, rate, onTime, completedCount: completedThisWeek.length, streak };
}
