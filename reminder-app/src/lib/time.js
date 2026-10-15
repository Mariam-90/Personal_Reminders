// All dates are handled in the user's local time zone. The API stores ISO (UTC) instants.

const MINUTE = 60 * 1000;
export const MISSED_AFTER_MINUTES = 60;

const pad = (n) => String(n).padStart(2, '0');

export const toDateInput = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const toTimeInput = (date) => {
  const d = new Date(date);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// "2026-10-15" + "09:30" in local time -> Date, or null when invalid.
export function fromInputs(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const result = new Date(y, m - 1, d, hh, mm, 0, 0);
  return Number.isNaN(result.getTime()) ? null : result;
}

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });

export const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const isSameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();

export function dayLabel(date, now = new Date()) {
  if (isSameDay(date, now)) return 'היום';
  if (isSameDay(date, addDays(now, 1))) return 'מחר';
  if (isSameDay(date, addDays(now, -1))) return 'אתמול';
  return formatDate(date);
}

// "בעוד 20 דקות" / "לפני שעה"
export function relativeTime(date, now = new Date()) {
  const diff = new Date(date).getTime() - now.getTime();
  const mins = Math.round(Math.abs(diff) / MINUTE);
  let text;
  if (mins < 1) return 'עכשיו';
  if (mins === 1) text = 'דקה';
  else if (mins < 60) text = `${mins} דקות`;
  else {
    const hours = Math.floor(mins / 60);
    const rest = mins % 60;
    if (hours >= 24) {
      const days = Math.round(hours / 24);
      text = days === 1 ? 'יום' : `${days} ימים`;
    } else {
      text = hours === 1 ? 'שעה' : hours === 2 ? 'שעתיים' : `${hours} שעות`;
      if (rest >= 5 && hours < 3) text += ` ו-${rest} דק׳`;
    }
  }
  return diff > 0 ? `בעוד ${text}` : `לפני ${text}`;
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return 'לילה טוב';
  if (h < 12) return 'בוקר טוב';
  if (h < 17) return 'צהריים טובים';
  if (h < 21) return 'ערב טוב';
  return 'לילה טוב';
}

// When the reminder should actually ring (after a snooze, if any).
export const dueTime = (r) => new Date(r.snoozeUntil || r.executionDate);

export function reminderStatus(r, now = new Date()) {
  if (r.isCompleted) return 'done';
  const due = dueTime(r).getTime();
  if (due > now.getTime()) return 'upcoming';
  if (now.getTime() - due > MISSED_AFTER_MINUTES * MINUTE) return 'missed';
  return 'due';
}

// Next quarter hour, at least 10 minutes from now - a friendly default for new reminders.
export function suggestedTime(now = new Date()) {
  const d = new Date(now.getTime() + 10 * MINUTE);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return d;
}
