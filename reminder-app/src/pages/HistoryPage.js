import React, { useMemo, useState } from 'react';
import { useReminders } from '../context/RemindersContext';
import useNow from '../hooks/useNow';
import useReminderActions from '../hooks/useReminderActions';
import ReminderCard from '../components/ReminderCard';
import ReminderDialogs from '../components/ReminderDialogs';
import { summary } from '../lib/stats';
import { dayLabel, dueTime, reminderStatus, startOfDay } from '../lib/time';

const SHORT_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

function WeekChart({ week }) {
  const max = Math.max(1, ...week.map((d) => d.done + d.missed));
  return (
    <div className="card">
      <h2 className="card-title">📊 השבוע שלי</h2>
      <div className="bars" role="img" aria-label="תזכורות שבוצעו ושפוספסו בשבוע האחרון">
        {week.map((d) => (
          <div className="bar-col" key={d.day.toISOString()}>
            <span className="bar-count">{d.done + d.missed || ''}</span>
            <div className="bar-stack">
              <div className="bar-done" style={{ height: `${(d.done / max) * 100}%` }} title={`בוצעו: ${d.done}`} />
              <div className="bar-missed" style={{ height: `${(d.missed / max) * 100}%` }} title={`פוספסו: ${d.missed}`} />
            </div>
            <span className="bar-label">{SHORT_DAYS[d.day.getDay()]}</span>
          </div>
        ))}
      </div>
      <div className="legend">
        <span>
          <i style={{ background: '#34d399' }} />
          בוצעו
        </span>
        <span>
          <i style={{ background: '#fb7185' }} />
          פוספסו
        </span>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { reminders, loading } = useReminders();
  const now = useNow(60000);
  const actions = useReminderActions();
  const [tab, setTab] = useState('done');

  const stats = useMemo(() => summary(reminders, now), [reminders, now]);

  const groups = useMemo(() => {
    const list = reminders
      .filter((r) => (tab === 'done' ? r.isCompleted : reminderStatus(r, now) === 'missed'))
      .sort((a, b) => dueTime(b) - dueTime(a))
      .slice(0, 100);
    const map = new Map();
    list.forEach((r) => {
      const key = startOfDay(dueTime(r)).getTime();
      if (!map.has(key)) map.set(key, { label: dayLabel(dueTime(r), now), items: [] });
      map.get(key).items.push(r);
    });
    return [...map.values()];
  }, [reminders, tab, now]);

  const message =
    stats.rate === null
      ? 'עוד אין מספיק נתונים. בקרוב יופיעו כאן הישגים!'
      : stats.rate >= 80
        ? 'שבוע מצוין! ממשיכים ככה 💪'
        : stats.rate >= 50
          ? 'שבוע טוב. אפשר להוסיף צליל חזק יותר כדי לא לפספס.'
          : 'נראה שקשה לשמוע את התזכורות. כדאי להפעיל התראות ולבחור צליל ברור.';

  return (
    <section className="page">
      <h1 className="page-title">
        <span className="grad-text">ההיסטוריה שלי</span>
      </h1>
      <p className="page-sub">{message}</p>

      <div className="stats">
        <div className="card stat">
          <div className="stat-value grad-text">{stats.rate === null ? '—' : `${stats.rate}%`}</div>
          <div className="stat-label">הצלחה השבוע</div>
        </div>
        <div className="card stat">
          <div className="stat-value">{stats.done}</div>
          <div className="stat-label">בוצעו השבוע</div>
        </div>
        <div className="card stat">
          <div className="stat-value">🔥 {stats.streak}</div>
          <div className="stat-label">ימים ברצף</div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <WeekChart week={stats.week} />
      </div>

      <div className="segmented" style={{ marginTop: 22 }}>
        <button type="button" className={tab === 'done' ? 'active' : ''} onClick={() => setTab('done')} aria-pressed={tab === 'done'}>
          ✔ בוצעו
        </button>
        <button type="button" className={tab === 'missed' ? 'active' : ''} onClick={() => setTab('missed')} aria-pressed={tab === 'missed'}>
          ⚠️ פוספסו
        </button>
      </div>

      {!loading && groups.length === 0 && (
        <div className="card empty" style={{ marginTop: 16 }}>
          <div className="empty-emoji">{tab === 'done' ? '🌱' : '🎉'}</div>
          <h3>{tab === 'done' ? 'עוד לא בוצעו תזכורות' : 'לא פוספס כלום!'}</h3>
        </div>
      )}

      {groups.map((g) => (
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
                onDelete={actions.onDelete}
                showRelative={false}
              />
            ))}
          </div>
        </div>
      ))}

      <ReminderDialogs actions={actions} />
    </section>
  );
}
