import { getLanguage, getLocale, t } from '../i18n';

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
  new Date(date).toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit', hour12: false });

export const formatDate = (date) =>
  new Date(date).toLocaleDateString(getLocale(), { weekday: 'long', day: 'numeric', month: 'long' });

const relativeFormat = (numeric) => new Intl.RelativeTimeFormat(getLocale(), { numeric });

// English labels like "today" read better capitalised when they stand alone.
const capitalise = (text) => (getLanguage().code === 'en' ? text.charAt(0).toUpperCase() + text.slice(1) : text);

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
  const days = Math.round((startOfDay(date) - startOfDay(now)) / (24 * 60 * MINUTE));
  if (Math.abs(days) <= 1) return capitalise(relativeFormat('auto').format(days, 'day'));
  return formatDate(date);
}

// "in 20 minutes" / "לפני שעה" / "خلال ساعتين", via Intl so plurals are right in every language.
export function relativeTime(date, now = new Date()) {
  const diff = new Date(date).getTime() - now.getTime();
  const mins = Math.round(diff / MINUTE);
  const rtf = relativeFormat('auto');
  if (Math.abs(mins) < 1) return rtf.format(0, 'second');
  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  return rtf.format(Math.round(hours / 24), 'day');
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return t('greeting.night');
  if (h < 12) return t('greeting.morning');
  if (h < 17) return t('greeting.afternoon');
  if (h < 21) return t('greeting.evening');
  return t('greeting.night');
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
