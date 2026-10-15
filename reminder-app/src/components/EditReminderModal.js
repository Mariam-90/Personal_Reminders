import React, { useState } from 'react';
import Modal from './Modal';
import { CATEGORIES, RECURRENCE_LABELS } from '../lib/categories';
import { fromInputs, toDateInput, toTimeInput } from '../lib/time';
import { useReminders } from '../context/RemindersContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../lib/api';

export default function EditReminderModal({ reminder, onClose }) {
  const { update } = useReminders();
  const toast = useToast();
  const [task, setTask] = useState(reminder.task);
  const [category, setCategory] = useState(reminder.category || 'general');
  const [date, setDate] = useState(toDateInput(reminder.executionDate));
  const [time, setTime] = useState(toTimeInput(reminder.executionDate));
  const [recurrence, setRecurrence] = useState(reminder.recurrence || 'none');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    const executionDate = fromInputs(date, time);
    if (!task.trim()) return setError('יש לכתוב מה צריך לעשות');
    if (!executionDate) return setError('יש לבחור תאריך ושעה');
    setBusy(true);
    try {
      await update(reminder._id, { task: task.trim(), category, executionDate, recurrence });
      toast('התזכורת עודכנה');
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
    return undefined;
  };

  return (
    <Modal title="עריכת תזכורת" onClose={onClose}>
      <form className="stack" onSubmit={save}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <label className="field">
          <span className="field-label">מה צריך לעשות?</span>
          <input className="input" value={task} onChange={(e) => setTask(e.target.value)} maxLength={200} />
        </label>
        <div className="field">
          <span className="field-label">סוג</span>
          <div className="chips">
            {CATEGORIES.map((c) => (
              <button type="button" key={c.id} className={`chip ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="when-grid">
          <label className="field">
            <span className="field-label">תאריך</span>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">שעה</span>
            <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
        </div>
        <div className="field">
          <span className="field-label">חזרה</span>
          <div className="segmented">
            {Object.entries(RECURRENCE_LABELS).map(([id, label]) => (
              <button type="button" key={id} className={recurrence === id ? 'active' : ''} onClick={() => setRecurrence(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'שומר…' : 'שמירה'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            ביטול
          </button>
        </div>
      </form>
    </Modal>
  );
}
