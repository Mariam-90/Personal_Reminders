import React, { useState } from 'react';
import Modal from './Modal';
import { CATEGORIES, categoryLabel, RECURRENCES, recurrenceLabel } from '../lib/categories';
import { useI18n } from '../context/I18nContext';
import { fromInputs, toDateInput, toTimeInput } from '../lib/time';
import { useReminders } from '../context/RemindersContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../lib/api';

export default function EditReminderModal({ reminder, onClose }) {
  const { t } = useI18n();
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
    if (!task.trim()) return setError(t('edit.needTask'));
    if (!executionDate) return setError(t('edit.needDate'));
    setBusy(true);
    try {
      await update(reminder._id, { task: task.trim(), category, executionDate, recurrence });
      toast(t('edit.updated'));
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
    return undefined;
  };

  return (
    <Modal title={t('edit.title')} onClose={onClose}>
      <form className="stack" onSubmit={save}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <label className="field">
          <span className="field-label">{t('edit.what')}</span>
          <input className="input" value={task} onChange={(e) => setTask(e.target.value)} maxLength={200} />
        </label>
        <div className="field">
          <span className="field-label">{t('edit.type')}</span>
          <div className="chips">
            {CATEGORIES.map((c) => (
              <button type="button" key={c.id} className={`chip ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
                {c.emoji} {categoryLabel(c.id)}
              </button>
            ))}
          </div>
        </div>
        <div className="when-grid">
          <label className="field">
            <span className="field-label">{t('edit.date')}</span>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">{t('edit.time')}</span>
            <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
        </div>
        <div className="field">
          <span className="field-label">{t('edit.repeat')}</span>
          <div className="segmented">
            {RECURRENCES.map((id) => (
              <button type="button" key={id} className={recurrence === id ? 'active' : ''} onClick={() => setRecurrence(id)}>
                {recurrenceLabel(id)}
              </button>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? t('common.saving') : t('common.save')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
