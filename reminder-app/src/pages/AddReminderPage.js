import React, { useState } from 'react';
import { useReminders } from '../context/RemindersContext';
import { useToast } from '../context/ToastContext';
import useRecorder from '../hooks/useRecorder';
import useDictation from '../hooks/useDictation';
import { CATEGORIES, getCategory, RECURRENCE_LABELS } from '../lib/categories';
import { addDays, dayLabel, formatTime, fromInputs, suggestedTime, toDateInput, toTimeInput } from '../lib/time';
import { errorMessage } from '../lib/api';

// One-tap times, relative to now.
const QUICK_TIMES = [
  { label: 'בעוד 30 דק׳', get: () => new Date(Date.now() + 30 * 60000) },
  { label: 'בעוד שעה', get: () => new Date(Date.now() + 60 * 60000) },
  { label: 'הערב 20:00', get: () => atHour(new Date(), 20) },
  { label: 'מחר 09:00', get: () => atHour(addDays(new Date(), 1), 9) },
];

function atHour(day, hour) {
  const d = new Date(day);
  d.setHours(hour, 0, 0, 0);
  return d;
}

const initialWhen = () => {
  const d = suggestedTime();
  return { date: toDateInput(d), time: toTimeInput(d) };
};

export default function AddReminderPage({ navigate }) {
  const { add } = useReminders();
  const toast = useToast();
  const recorder = useRecorder();
  const [category, setCategory] = useState('general');
  const [task, setTask] = useState('');
  const [when, setWhen] = useState(initialWhen);
  const [recurrence, setRecurrence] = useState('none');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const dictation = useDictation((text) => setTask((t) => (t ? `${t} ${text}` : text)));

  const executionDate = fromInputs(when.date, when.time);
  const cat = getCategory(category);
  const inPast = executionDate && executionDate < new Date(Date.now() - 60000);

  const pickTemplate = (c) => {
    setCategory(c.id);
    if (c.task) setTask(c.task);
  };

  const pickTime = (d) => setWhen({ date: toDateInput(d), time: toTimeInput(d) });

  const submit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return setError('יש לכתוב מה צריך לעשות');
    if (!executionDate) return setError('יש לבחור תאריך ושעה');
    if (recorder.recording) recorder.stop();
    setBusy(true);
    setError('');
    try {
      await add({ task: task.trim(), category, executionDate, recurrence, recording: recorder.blob });
      toast(`נשמר! אזכיר לך ${dayLabel(executionDate)} ב-${formatTime(executionDate)} 🔔`);
      navigate('today');
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
    return undefined;
  };

  return (
    <section className="page">
      <h1 className="page-title">
        <span className="grad-text">תזכורת חדשה</span>
      </h1>
      <p className="page-sub">שלושה צעדים קטנים: מה, מתי, וכמה פעמים.</p>

      <form className="stack" onSubmit={submit} noValidate>
        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="card stack">
          <h2 className="card-title">1. מה צריך לעשות?</h2>
          <div className="templates">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.id}
                className={`template ${category === c.id ? 'active' : ''}`}
                style={{ '--cat': c.color }}
                onClick={() => pickTemplate(c)}
                aria-pressed={category === c.id}
              >
                <span className="t-emoji" aria-hidden="true">{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
          <label className="field">
            <span className="field-label">תיאור</span>
            <div className="input-with-btn">
              <input
                className="input"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="למשל: לקחת כדור לחץ דם"
                maxLength={200}
              />
              {dictation.supported && (
                <button
                  type="button"
                  className="icon-btn"
                  onClick={dictation.toggle}
                  aria-label={dictation.listening ? 'הפסקת הכתבה' : 'הכתבה קולית'}
                  title="הכתבה קולית"
                >
                  {dictation.listening ? '⏹️' : '🎙️'}
                </button>
              )}
            </div>
            {dictation.listening && <span className="field-hint">מקשיב… אפשר לדבר</span>}
          </label>
        </div>

        <div className="card stack">
          <h2 className="card-title">2. מתי?</h2>
          <div className="chips">
            {QUICK_TIMES.map((q) => (
              <button type="button" key={q.label} className="chip" onClick={() => pickTime(q.get())}>
                {q.label}
              </button>
            ))}
          </div>
          <div className="when-grid">
            <label className="field">
              <span className="field-label">תאריך</span>
              <input className="input" type="date" value={when.date} onChange={(e) => setWhen({ ...when, date: e.target.value })} />
            </label>
            <label className="field">
              <span className="field-label">שעה</span>
              <input className="input" type="time" value={when.time} onChange={(e) => setWhen({ ...when, time: e.target.value })} />
            </label>
          </div>
          {inPast && <span className="badge badge-warn">⚠️ הזמן שנבחר כבר עבר</span>}
        </div>

        <div className="card stack">
          <h2 className="card-title">3. כמה פעמים?</h2>
          <div className="segmented">
            {Object.entries(RECURRENCE_LABELS).map(([id, label]) => (
              <button type="button" key={id} className={recurrence === id ? 'active' : ''} onClick={() => setRecurrence(id)} aria-pressed={recurrence === id}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="card stack">
          <h2 className="card-title">
            🎤 הקלטה קולית <span className="badge">לא חובה</span>
          </h2>
          <p style={{ color: 'var(--muted)' }}>הקליטו את התזכורת בקול שלכם או של בן משפחה. היא תושמע בזמן התזכורת.</p>
          <div className="recorder">
            {recorder.recording ? (
              <>
                <span className="rec-dot" aria-hidden="true" />
                <span>מקליט… {recorder.seconds} שנ׳</span>
                <button type="button" className="btn btn-danger" onClick={recorder.stop}>
                  ⏹️ עצירה
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={recorder.start}>
                {recorder.blob ? '🔁 הקלטה מחדש' : '🎙️ התחלת הקלטה'}
              </button>
            )}
            {recorder.url && !recorder.recording && (
              <>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls src={recorder.url} />
                <button type="button" className="icon-btn" onClick={recorder.clear} aria-label="מחיקת ההקלטה">
                  🗑️
                </button>
              </>
            )}
          </div>
          {recorder.error && <div className="form-error">{recorder.error}</div>}
        </div>

        {task.trim() && executionDate && (
          <div className="summary" aria-live="polite">
            <span className="s-emoji" aria-hidden="true">{cat.emoji}</span>
            <div>
              <strong>{task.trim()}</strong>
              <div style={{ color: 'var(--muted)' }}>
                {dayLabel(executionDate)} ב-{formatTime(executionDate)} · {RECURRENCE_LABELS[recurrence]}
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-xl btn-block" disabled={busy}>
          {busy ? 'שומר…' : '🔔 שמירת התזכורת'}
        </button>
      </form>
    </section>
  );
}
