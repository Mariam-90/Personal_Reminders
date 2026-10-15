import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { useReminders } from '../context/RemindersContext';
import { useToast } from '../context/ToastContext';
import useRecorder from '../hooks/useRecorder';
import useDictation from '../hooks/useDictation';
import { CATEGORIES, categoryLabel, categoryTask, getCategory, RECURRENCES, recurrenceLabel } from '../lib/categories';
import { addDays, dayLabel, formatTime, fromInputs, suggestedTime, toDateInput, toTimeInput } from '../lib/time';
import { errorMessage } from '../lib/api';

function atHour(day, hour) {
  const d = new Date(day);
  d.setHours(hour, 0, 0, 0);
  return d;
}

// One-tap times, relative to now. `key` is the i18n key under "add".
const QUICK_TIMES = [
  { key: 'in30', get: () => new Date(Date.now() + 30 * 60000) },
  { key: 'in60', get: () => new Date(Date.now() + 60 * 60000) },
  { key: 'tonight', get: () => atHour(new Date(), 20) },
  { key: 'tomorrow', get: () => atHour(addDays(new Date(), 1), 9) },
];

const initialWhen = () => {
  const d = suggestedTime();
  return { date: toDateInput(d), time: toTimeInput(d) };
};

export default function AddReminderPage({ navigate }) {
  const { t } = useI18n();
  const { add } = useReminders();
  const toast = useToast();
  const recorder = useRecorder();
  const [category, setCategory] = useState('general');
  const [task, setTask] = useState('');
  const [when, setWhen] = useState(initialWhen);
  const [recurrence, setRecurrence] = useState('none');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const dictation = useDictation((text) => setTask((prev) => (prev ? `${prev} ${text}` : text)));

  const executionDate = fromInputs(when.date, when.time);
  const cat = getCategory(category);
  const inPast = executionDate && executionDate < new Date(Date.now() - 60000);

  const pickTemplate = (id) => {
    setCategory(id);
    const preset = categoryTask(id);
    if (preset) setTask(preset);
  };

  const pickTime = (d) => setWhen({ date: toDateInput(d), time: toTimeInput(d) });

  const submit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return setError(t('edit.needTask'));
    if (!executionDate) return setError(t('edit.needDate'));
    if (recorder.recording) recorder.stop();
    setBusy(true);
    setError('');
    try {
      await add({ task: task.trim(), category, executionDate, recurrence, recording: recorder.blob });
      toast(t('add.saved', { day: dayLabel(executionDate), time: formatTime(executionDate) }));
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
        <span className="grad-text">{t('add.title')}</span>
      </h1>
      <p className="page-sub">{t('add.subtitle')}</p>

      <form className="stack" onSubmit={submit} noValidate>
        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="card stack">
          <h2 className="card-title">{t('add.step1')}</h2>
          <div className="templates">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.id}
                className={`template ${category === c.id ? 'active' : ''}`}
                style={{ '--cat': c.color }}
                onClick={() => pickTemplate(c.id)}
                aria-pressed={category === c.id}
              >
                <span className="t-emoji" aria-hidden="true">{c.emoji}</span>
                {categoryLabel(c.id)}
              </button>
            ))}
          </div>
          <label className="field">
            <span className="field-label">{t('add.description')}</span>
            <div className="input-with-btn">
              <input className="input" value={task} onChange={(e) => setTask(e.target.value)} placeholder={t('add.placeholder')} maxLength={200} />
              {dictation.supported && (
                <button
                  type="button"
                  className="icon-btn"
                  onClick={dictation.toggle}
                  aria-label={dictation.listening ? t('add.stopDictate') : t('add.dictate')}
                  title={t('add.dictate')}
                >
                  {dictation.listening ? '⏹️' : '🎙️'}
                </button>
              )}
            </div>
            {dictation.listening && <span className="field-hint">{t('add.listening')}</span>}
          </label>
        </div>

        <div className="card stack">
          <h2 className="card-title">{t('add.step2')}</h2>
          <div className="chips">
            {QUICK_TIMES.map((q) => (
              <button type="button" key={q.key} className="chip" onClick={() => pickTime(q.get())}>
                {t(`add.${q.key}`)}
              </button>
            ))}
          </div>
          <div className="when-grid">
            <label className="field">
              <span className="field-label">{t('add.date')}</span>
              <input className="input" type="date" value={when.date} onChange={(e) => setWhen({ ...when, date: e.target.value })} />
            </label>
            <label className="field">
              <span className="field-label">{t('add.time')}</span>
              <input className="input" type="time" value={when.time} onChange={(e) => setWhen({ ...when, time: e.target.value })} />
            </label>
          </div>
          {inPast && <span className="badge badge-warn">{t('add.past')}</span>}
        </div>

        <div className="card stack">
          <h2 className="card-title">{t('add.step3')}</h2>
          <div className="segmented">
            {RECURRENCES.map((id) => (
              <button type="button" key={id} className={recurrence === id ? 'active' : ''} onClick={() => setRecurrence(id)} aria-pressed={recurrence === id}>
                {recurrenceLabel(id)}
              </button>
            ))}
          </div>
        </div>

        <div className="card stack">
          <h2 className="card-title">
            {t('add.recording')} <span className="badge">{t('common.optional')}</span>
          </h2>
          <p style={{ color: 'var(--muted)' }}>{t('add.recordingHelp')}</p>
          <div className="recorder">
            {recorder.recording ? (
              <>
                <span className="rec-dot" aria-hidden="true" />
                <span>{t('add.recordingNow', { seconds: recorder.seconds })}</span>
                <button type="button" className="btn btn-danger" onClick={recorder.stop}>
                  {t('add.stop')}
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={recorder.start}>
                {recorder.blob ? t('add.rerecord') : t('add.startRecord')}
              </button>
            )}
            {recorder.url && !recorder.recording && (
              <>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls src={recorder.url} />
                <button type="button" className="icon-btn" onClick={recorder.clear} aria-label={t('add.deleteRecording')}>
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
              <strong dir="auto">{task.trim()}</strong>
              <div style={{ color: 'var(--muted)' }}>
                {t('add.summary', { day: dayLabel(executionDate), time: formatTime(executionDate), repeat: recurrenceLabel(recurrence) })}
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-xl btn-block" disabled={busy}>
          {busy ? t('common.saving') : t('add.save')}
        </button>
      </form>
    </section>
  );
}
