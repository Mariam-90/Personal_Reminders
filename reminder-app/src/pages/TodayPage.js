import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useReminders } from '../context/RemindersContext';
import useNow from '../hooks/useNow';
import useReminderActions from '../hooks/useReminderActions';
import ReminderCard from '../components/ReminderCard';
import ReminderDialogs from '../components/ReminderDialogs';
import ProgressRing from '../components/ProgressRing';
import { getCategory } from '../lib/categories';
import { dayLabel, dueTime, formatDate, formatTime, greeting, isSameDay, relativeTime, reminderStatus } from '../lib/time';
import { hasCaregiver, telLink, whatsappLink } from '../lib/caregiver';
import { speak } from '../lib/sounds';

function Clock() {
  const { t } = useI18n();
  const now = useNow(1000);
  return (
    <div className="clock" aria-label={t('today.clock', { time: formatTime(now) })}>
      {formatTime(now)}
    </div>
  );
}

function Hero({ reminder, now, actions }) {
  const { t } = useI18n();
  const cat = getCategory(reminder.category);
  const due = dueTime(reminder);
  const isDue = reminderStatus(reminder, now) === 'due';

  return (
    <section className="card hero" style={{ '--hero-color': cat.color }} aria-label={t('today.nextAria')}>
      <span className={`hero-kicker ${isDue ? 'due' : ''}`}>
        {isDue ? t('today.timeIs') : t('today.upNext', { rel: relativeTime(due, now) })}
      </span>
      <div className="hero-main">
        <div className="hero-emoji" aria-hidden="true">{cat.emoji}</div>
        <div>
          <div className="hero-task" dir="auto">{reminder.task}</div>
          <div className="hero-when">{t('today.when', { day: dayLabel(due, now), time: formatTime(due) })}</div>
        </div>
      </div>
      <div className="hero-actions">
        <button type="button" className="btn btn-success btn-xl" onClick={() => actions.onComplete(reminder._id)}>
          {t('today.did')}
        </button>
        <button type="button" className="btn btn-ghost btn-xl" onClick={() => actions.onSnooze(reminder._id, 10)} title={t('today.snoozeTitle')}>
          {t('today.snooze')}
        </button>
        <button type="button" className="btn btn-ghost btn-xl" onClick={() => speak(reminder.task)} title={t('today.readAloud')} aria-label={t('today.readAloud')}>
          🔊
        </button>
      </div>
    </section>
  );
}

export default function TodayPage({ navigate }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { reminders, loading } = useReminders();
  const now = useNow(15000);
  const actions = useReminderActions();

  const { today, missed, hero, doneToday } = useMemo(() => {
    const todays = reminders.filter((r) => isSameDay(dueTime(r), now) || isSameDay(r.executionDate, now));
    const missedList = reminders.filter((r) => reminderStatus(r, now) === 'missed' && now - dueTime(r) < 48 * 3600 * 1000);
    const pending = reminders.filter((r) => !r.isCompleted).sort((a, b) => dueTime(a) - dueTime(b));
    const heroPick =
      pending.find((r) => reminderStatus(r, now) === 'due') ||
      pending.find((r) => reminderStatus(r, now) === 'upcoming') ||
      null;
    return {
      today: todays,
      missed: missedList,
      hero: heroPick,
      doneToday: todays.filter((r) => r.isCompleted).length,
    };
  }, [reminders, now]);

  const name = user.fullName || user.username;

  return (
    <section className="page">
      <div className="hello">
        <div>
          <h1>
            {greeting(now)}, <bdi className="grad-text">{name}</bdi>
          </h1>
          <div className="date">{formatDate(now)}</div>
        </div>
        <Clock />
      </div>

      {loading ? (
        <div className="stack">
          <div className="skeleton" style={{ height: 220 }} />
          <div className="skeleton" />
        </div>
      ) : hero ? (
        <Hero reminder={hero} now={now} actions={actions} />
      ) : (
        <div className="card empty">
          <div className="empty-emoji">🌤️</div>
          <h3>{t('today.emptyTitle')}</h3>
          <p>{t('today.emptyText')}</p>
          <button type="button" className="btn btn-primary btn-xl" onClick={() => navigate('add')}>
            {t('common.newReminder')}
          </button>
        </div>
      )}

      <div className="today-grid">
        <div>
          {missed.length > 0 && (
            <>
              <h2 className="section-label">{t('today.notDone')}</h2>
              <div className="timeline">
                {missed.map((r) => (
                  <ReminderCard key={r._id} reminder={r} now={now} onComplete={actions.onComplete} onDelete={actions.onDelete} />
                ))}
              </div>
              {hasCaregiver(user) && (
                <div className="card sos-card" style={{ marginTop: 12 }}>
                  <span className="sos-emoji" aria-hidden="true">💬</span>
                  <div className="sos-text">
                    <strong>{t('today.needHelp')}</strong>
                    <small>{t('today.tellCaregiver', { name: user.caregiverName || t('header.theContact') })}</small>
                  </div>
                  <a
                    className="btn btn-accent btn-sm"
                    target="_blank"
                    rel="noreferrer"
                    href={whatsappLink(
                      user.caregiverPhone,
                      t('today.missedMessage', {
                        name,
                        list: missed.map((r) => `${r.task} (${formatTime(r.executionDate)})`).join(', '),
                      })
                    )}
                  >
                    {t('today.whatsapp')}
                  </a>
                  <a className="btn btn-ghost btn-sm" href={telLink(user.caregiverPhone)} aria-label={t('header.callHelp')}>
                    📞
                  </a>
                </div>
              )}
            </>
          )}

          <h2 className="section-label">{t('today.plan')}</h2>
          {today.length ? (
            <div className="timeline">
              {today.map((r) => (
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
          ) : (
            !loading && <div className="card" style={{ color: 'var(--muted)' }}>{t('today.noneToday')}</div>
          )}
        </div>

        <aside className="stack">
          <h2 className="section-label">{t('today.progress')}</h2>
          <div className="card progress-card">
            <ProgressRing value={doneToday} total={today.length} />
            <div>
              <h3>{t('today.doneOf', { done: doneToday, total: today.length })}</h3>
              <p>{today.length && doneToday === today.length ? t('today.allDone') : t('today.keepGoing')}</p>
            </div>
          </div>
          <button type="button" className="btn btn-primary btn-xl btn-block" onClick={() => navigate('add')}>
            {t('common.newReminder')}
          </button>
        </aside>
      </div>

      <ReminderDialogs actions={actions} />
    </section>
  );
}
