import React, { useMemo, useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { useReminders } from '../context/RemindersContext';
import useNow from '../hooks/useNow';
import useReminderActions from '../hooks/useReminderActions';
import ReminderCard from '../components/ReminderCard';
import ReminderDialogs from '../components/ReminderDialogs';
import { dayLabel, dueTime, reminderStatus, startOfDay } from '../lib/time';

const FILTERS = [
  { id: 'upcoming', test: (r, now) => ['upcoming', 'due'].includes(reminderStatus(r, now)) },
  { id: 'recurring', test: (r) => r.recurrence !== 'none' && !r.isCompleted },
  { id: 'all', test: () => true },
];

function groupByDay(list, now) {
  const groups = new Map();
  list.forEach((r) => {
    const key = startOfDay(dueTime(r)).getTime();
    if (!groups.has(key)) groups.set(key, { key, label: dayLabel(dueTime(r), now), items: [] });
    groups.get(key).items.push(r);
  });
  return [...groups.values()];
}

export default function RemindersPage({ navigate }) {
  const { t } = useI18n();
  const { reminders, loading } = useReminders();
  const now = useNow(30000);
  const actions = useReminderActions();
  const [filter, setFilter] = useState('upcoming');
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter);
    const q = query.trim().toLowerCase();
    const list = reminders
      .filter((r) => f.test(r, now))
      .filter((r) => !q || r.task.toLowerCase().includes(q))
      .sort((a, b) => dueTime(a) - dueTime(b));
    return groupByDay(filter === 'all' ? list.reverse() : list, now);
  }, [reminders, filter, query, now]);

  return (
    <section className="page">
      <h1 className="page-title">
        <span className="grad-text">{t('list.title')}</span>
      </h1>
      <p className="page-sub">{t('list.subtitle')}</p>

      <div className="toolbar">
        <input className="input" type="search" placeholder={t('list.search')} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('list.searchAria')} />
      </div>
      <div className="segmented" style={{ marginBottom: 8 }}>
        {FILTERS.map((f) => (
          <button type="button" key={f.id} className={filter === f.id ? 'active' : ''} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}>
            {t(`list.${f.id}`)}
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
          <h3>{query ? t('list.noResults') : t('list.empty')}</h3>
          <p>{query ? t('list.tryOther') : t('list.addFirst')}</p>
          {!query && (
            <button type="button" className="btn btn-primary btn-xl" onClick={() => navigate('add')}>
              {t('common.newReminder')}
            </button>
          )}
        </div>
      ) : (
        groups.map((g) => (
          <div className="day-group" key={g.key}>
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
