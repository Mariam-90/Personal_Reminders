import React, { useMemo, useState } from 'react';
import { useReminders } from '../context/RemindersContext';
import useNow from '../hooks/useNow';
import useReminderActions from '../hooks/useReminderActions';
import ReminderCard from '../components/ReminderCard';
import ReminderDialogs from '../components/ReminderDialogs';
import { dayLabel, dueTime, reminderStatus, startOfDay } from '../lib/time';

const FILTERS = [
  { id: 'upcoming', label: 'הקרובות', test: (r, now) => ['upcoming', 'due'].includes(reminderStatus(r, now)) },
  { id: 'recurring', label: 'קבועות', test: (r) => r.recurrence !== 'none' && !r.isCompleted },
  { id: 'all', label: 'הכל', test: () => true },
];

function groupByDay(list, now) {
  const groups = new Map();
  list.forEach((r) => {
    const key = startOfDay(dueTime(r)).getTime();
    if (!groups.has(key)) groups.set(key, { label: dayLabel(dueTime(r), now), items: [] });
    groups.get(key).items.push(r);
  });
  return [...groups.values()];
}

export default function RemindersPage({ navigate }) {
  const { reminders, loading } = useReminders();
  const now = useNow(30000);
  const actions = useReminderActions();
  const [filter, setFilter] = useState('upcoming');
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter);
    const q = query.trim();
    const list = reminders
      .filter((r) => f.test(r, now))
      .filter((r) => !q || r.task.includes(q))
      .sort((a, b) => dueTime(a) - dueTime(b));
    return groupByDay(filter === 'all' ? list.reverse() : list, now);
  }, [reminders, filter, query, now]);

  return (
    <section className="page">
      <h1 className="page-title">
        <span className="grad-text">התזכורות שלי</span>
      </h1>
      <p className="page-sub">כל מה שמתוכנן, מסודר לפי ימים.</p>

      <div className="toolbar">
        <input className="input" type="search" placeholder="🔍 חיפוש תזכורת…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="חיפוש" />
      </div>
      <div className="segmented" style={{ marginBottom: 8 }}>
        {FILTERS.map((f) => (
          <button type="button" key={f.id} className={filter === f.id ? 'active' : ''} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="stack" style={{ marginTop: 20 }}>
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      ) : groups.length === 0 ? (
        <div className="card empty" style={{ marginTop: 20 }}>
          <div className="empty-emoji">{query ? '🔍' : '📭'}</div>
          <h3>{query ? 'לא נמצאו תזכורות' : 'אין כאן תזכורות'}</h3>
          <p>{query ? 'נסו מילה אחרת.' : 'זה הזמן להוסיף את הראשונה.'}</p>
          {!query && (
            <button type="button" className="btn btn-primary btn-xl" onClick={() => navigate('add')}>
              + תזכורת חדשה
            </button>
          )}
        </div>
      ) : (
        groups.map((g) => (
          <div className="day-group" key={g.label}>
            <h2 className="section-label">{g.label}</h2>
            <div className="timeline">
              {g.items.map((r) => (
                <ReminderCard
                  key={r._id}
                  reminder={r}
                  now={now}
                  onComplete={actions.onComplete}
                  onUndo={actions.onUndo}
                  onEdit={actions.onEdit}
                  onDelete={actions.onDelete}
                />
              ))}
            </div>
          </div>
        ))
      )}

      <ReminderDialogs actions={actions} />
    </section>
  );
}
