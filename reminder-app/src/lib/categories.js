// Quick templates for the people this app is built for: one tap fills the task.
export const CATEGORIES = [
  { id: 'pill', emoji: '💊', label: 'תרופה', task: 'לקחת תרופה', color: '#f472b6' },
  { id: 'water', emoji: '💧', label: 'שתייה', task: 'לשתות כוס מים', color: '#22d3ee' },
  { id: 'meal', emoji: '🍽️', label: 'ארוחה', task: 'לאכול ארוחה', color: '#fbbf24' },
  { id: 'walk', emoji: '🚶', label: 'הליכה', task: 'לצאת להליכה קצרה', color: '#34d399' },
  { id: 'call', emoji: '📞', label: 'שיחה', task: 'להתקשר למשפחה', color: '#a78bfa' },
  { id: 'doctor', emoji: '🩺', label: 'רופא', task: 'תור לרופא', color: '#60a5fa' },
  { id: 'sleep', emoji: '😴', label: 'מנוחה', task: 'לנוח קצת', color: '#818cf8' },
  { id: 'general', emoji: '🔔', label: 'אחר', task: '', color: '#c4b5fd' },
];

const byId = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
export const getCategory = (id) => byId[id] || byId.general;

export const RECURRENCE_LABELS = {
  none: 'פעם אחת',
  daily: 'כל יום',
  weekly: 'כל שבוע',
  monthly: 'כל חודש',
};
