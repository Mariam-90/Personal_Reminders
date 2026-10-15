import React from 'react';
import { getCategory, RECURRENCE_LABELS } from '../lib/categories';
import { dueTime, formatTime, reminderStatus, relativeTime } from '../lib/time';
import { uploadsUrl } from '../lib/api';
import { speak } from '../lib/sounds';

const STATUS_BADGE = {
  done: { className: 'badge-ok', text: '✔ בוצע' },
  missed: { className: 'badge-bad', text: 'פוספס' },
  due: { className: 'badge-warn', text: 'עכשיו!' },
};

export default function ReminderCard({ reminder, now, onComplete, onUndo, onEdit, onDelete, showRelative = true }) {
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
          aria-label={done ? `ביטול סימון: ${reminder.task}` : `סימון כבוצע: ${reminder.task}`}
          aria-pressed={done}
        >
          ✓
        </button>
      )}
      <div className="r-emoji" aria-hidden="true">{cat.emoji}</div>
      <div className="r-body">
        <div className="r-task">{reminder.task}</div>
        <div className="r-meta">
          <span className="r-time">{formatTime(reminder.executionDate)}</span>
          {showRelative && status === 'upcoming' && <span>{relativeTime(dueTime(reminder), now)}</span>}
          {snoozed && <span className="badge">⏰ נדחה ל-{formatTime(reminder.snoozeUntil)}</span>}
          {reminder.recurrence !== 'none' && <span className="badge">🔁 {RECURRENCE_LABELS[reminder.recurrence]}</span>}
          {badge && <span className={`badge ${badge.className}`}>{badge.text}</span>}
          {done && reminder.completionDate && <span>בשעה {formatTime(reminder.completionDate)}</span>}
        </div>
      </div>
      <div className="r-actions">
        <button
          type="button"
          className="icon-btn"
          title="השמעה"
          aria-label={`השמעת התזכורת: ${reminder.task}`}
          onClick={() =>
            reminder.recordedTaskAudioFileName
              ? new Audio(uploadsUrl(reminder.recordedTaskAudioFileName)).play().catch(() => speak(reminder.task))
              : speak(reminder.task)
          }
        >
          🔊
        </button>
        {onEdit && !done && (
          <button type="button" className="icon-btn" title="עריכה" aria-label={`עריכה: ${reminder.task}`} onClick={() => onEdit(reminder)}>
            ✏️
          </button>
        )}
        {onDelete && (
          <button type="button" className="icon-btn" title="מחיקה" aria-label={`מחיקה: ${reminder.task}`} onClick={() => onDelete(reminder)}>
            🗑️
          </button>
        )}
      </div>
    </article>
  );
}
