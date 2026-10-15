import { t } from '../i18n';

// Quick templates for the people this app is built for: one tap fills the task.
// Labels and default tasks come from the active language (i18n: categories.<id>).
export const CATEGORIES = [
  { id: 'pill', emoji: '💊', color: '#f472b6' },
  { id: 'water', emoji: '💧', color: '#22d3ee' },
  { id: 'meal', emoji: '🍽️', color: '#fbbf24' },
  { id: 'walk', emoji: '🚶', color: '#34d399' },
  { id: 'call', emoji: '📞', color: '#a78bfa' },
  { id: 'doctor', emoji: '🩺', color: '#60a5fa' },
  { id: 'sleep', emoji: '😴', color: '#818cf8' },
  { id: 'general', emoji: '🔔', color: '#c4b5fd' },
];

const byId = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
export const getCategory = (id) => byId[id] || byId.general;

export const categoryLabel = (id) => t(`categories.${getCategory(id).id}.label`);
export const categoryTask = (id) => t(`categories.${getCategory(id).id}.task`);

export const RECURRENCES = ['none', 'daily', 'weekly', 'monthly'];
export const recurrenceLabel = (id) => t(`recurrence.${id}`);
