import React from 'react';
import { getCategory, recurrenceLabel } from '../lib/categories';
import { useI18n } from '../context/I18nContext';
import { dueTime, formatTime, reminderStatus, relativeTime } from '../lib/time';
import { uploadsUrl } from '../lib/api';
import { speak } from '../lib/sounds';

const STATUS_BADGE = {
  done: 'badge-ok',
  missed: 'badge-bad',
  due: 'badge-warn',
};

export default function ReminderCard({ reminder, now, onComplete, onUndo, onEdit, onDelete, showRelative = true }) {
  const { t } = useI18n();
  const cat = getCategory(reminder.category);
  const status = reminderStatus(reminder, now);
  const badge = STATUS_BADGE[status];
  const done = status === 'done';
  const snoozed = reminder.snoozeUntil && !done;

  const toggle = () => (done ? onUndo?.(reminder._id) : onComplete?.(reminder._id));

  return (
    <article className={`r-card is-${status}`} style={{ '--cat': cat.color }}>
      {(onComplete || onUndo) && (
        <button
          type="button"
          className={`check-btn ${done ? 'checked' : ''}`}
          onClick={toggle}
          aria-label={t(done ? 'card.unmark' : 'card.markDone', { task: reminder.task })}
          aria-pressed={done}
        >
          ✓
        </button>
      )}
      <div className="r-emoji" aria-hidden="true">{cat.emoji}</div>
      <div className="r-body">
        <div className="r-task" dir="auto">{reminder.task}</div>
        <div className="r-meta">
          <span className="r-time">{formatTime(reminder.executionDate)}</span>
          {showRelative && status === 'upcoming' && <span>{relativeTime(dueTime(reminder), now)}</span>}
          {snoozed && <span className="badge">{t('card.snoozedTo', { time: formatTime(reminder.snoozeUntil) })}</span>}
          {reminder.recurrence !== 'none' && <span className="badge">🔁 {recurrenceLabel(reminder.recurrence)}</span>}
          {badge && <span className={`badge ${badge}`}>{t(`status.${status}`)}</span>}
          {done && reminder.completionDate && <span>{t('card.doneAt', { time: formatTime(reminder.completionDate) })}</span>}
        </div>
      </div>
      <div className="r-actions">
        <button
          type="button"
          className="icon-btn"
          title={t('card.playTitle')}
          aria-label={t('card.play', { task: reminder.task })}
          onClick={() =>
            reminder.recordedTaskAudioFileName
              ? new Audio(uploadsUrl(reminder.recordedTaskAudioFileName)).play().catch(() => speak(reminder.task))
              : speak(reminder.task)
          }
        >
          🔊
        </button>
        {onEdit && !done && (
          <button type="button" className="icon-btn" title={t('card.editTitle')} aria-label={t('card.edit', { task: reminder.task })} onClick={() => onEdit(reminder)}>
            ✏️
          </button>
        )}
        {onDelete && (
          <button type="button" className="icon-btn" title={t('card.deleteTitle')} aria-label={t('card.delete', { task: reminder.task })} onClick={() => onDelete(reminder)}>
            🗑️
          </button>
        )}
      </div>
    </article>
  );
}
