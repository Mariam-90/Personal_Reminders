import React from 'react';
import EditReminderModal from './EditReminderModal';
import { ConfirmDialog } from './Modal';
import { useI18n } from '../context/I18nContext';

// Renders the edit / delete dialogs driven by useReminderActions().
export default function ReminderDialogs({ actions }) {
  const { t } = useI18n();
  return (
    <>
      {actions.editing && <EditReminderModal reminder={actions.editing} onClose={actions.closeEdit} />}
      {actions.deleting && (
        <ConfirmDialog
          title={t('dialogs.deleteTitle')}
          message={t('dialogs.deleteMessage', { task: actions.deleting.task })}
          onConfirm={actions.confirmDelete}
          onCancel={actions.cancelDelete}
        />
      )}
    </>
  );
}
