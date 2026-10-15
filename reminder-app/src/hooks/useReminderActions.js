import { useCallback, useState } from 'react';
import { useReminders } from '../context/RemindersContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../lib/api';
import { dayLabel, formatTime } from '../lib/time';
import { useI18n } from '../context/I18nContext';

// Complete / undo / snooze / delete with friendly feedback, shared by all pages.
export default function useReminderActions() {
  const { t } = useI18n();
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
          const cheers = t('actions.cheers');
          const cheer = cheers[Math.floor(Math.random() * cheers.length)];
          const next = res.next
            ? t('actions.next', { day: dayLabel(res.next.executionDate), time: formatTime(res.next.executionDate) })
            : '';
          toast(`${cheer}${next}`, { action: { label: t('actions.undo'), onClick: () => run(() => undo(id)) } });
        }
      ),
    [run, complete, undo, toast, t]
  );

  const onUndo = useCallback((id) => run(() => undo(id), () => toast(t('actions.undone'), { type: 'info' })), [run, undo, toast, t]);

  const onSnooze = useCallback(
    (id, minutes = 10) => run(() => snooze(id, minutes), () => toast(t('actions.snoozed', { minutes }), { type: 'info' })),
    [run, snooze, toast, t]
  );

  const confirmDelete = useCallback(
    () =>
      run(
        () => remove(deleting._id),
        () => {
          toast(t('actions.deleted'), { type: 'info' });
          setDeleting(null);
        }
      ),
    [run, remove, deleting, toast, t]
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
