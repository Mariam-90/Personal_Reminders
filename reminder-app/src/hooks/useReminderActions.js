import { useCallback, useState } from 'react';
import { useReminders } from '../context/RemindersContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../lib/api';
import { dayLabel, formatTime } from '../lib/time';

const CHEERS = ['כל הכבוד! 🎉', 'מעולה! 👏', 'יופי, בוצע ✔', 'איזה יופי! 🌟'];

// Complete / undo / snooze / delete with friendly feedback, shared by all pages.
export default function useReminderActions() {
  const { complete, undo, snooze, remove } = useReminders();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const run = useCallback(
    async (fn, success) => {
      try {
        const result = await fn();
        if (success) success(result);
        return result;
      } catch (err) {
        toast(errorMessage(err), { type: 'error' });
        return null;
      }
    },
    [toast]
  );

  const onComplete = useCallback(
    (id) =>
      run(
        () => complete(id),
        (res) => {
          const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)];
          const next = res.next ? ` הבאה: ${dayLabel(res.next.executionDate)} ב-${formatTime(res.next.executionDate)}` : '';
          toast(`${cheer}${next}`, { action: { label: 'ביטול', onClick: () => run(() => undo(id)) } });
        }
      ),
    [run, complete, undo, toast]
  );

  const onUndo = useCallback((id) => run(() => undo(id), () => toast('הסימון בוטל', { type: 'info' })), [run, undo, toast]);

  const onSnooze = useCallback(
    (id, minutes = 10) => run(() => snooze(id, minutes), () => toast(`אזכיר שוב בעוד ${minutes} דקות ⏰`, { type: 'info' })),
    [run, snooze, toast]
  );

  const confirmDelete = useCallback(
    () =>
      run(
        () => remove(deleting._id),
        () => {
          toast('התזכורת נמחקה', { type: 'info' });
          setDeleting(null);
        }
      ),
    [run, remove, deleting, toast]
  );

  return {
    onComplete,
    onUndo,
    onSnooze,
    onEdit: setEditing,
    onDelete: setDeleting,
    editing,
    closeEdit: () => setEditing(null),
    deleting,
    cancelDelete: () => setDeleting(null),
    confirmDelete,
  };
}
