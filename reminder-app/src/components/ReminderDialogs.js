import React from 'react';
import EditReminderModal from './EditReminderModal';
import { ConfirmDialog } from './Modal';

// Renders the edit / delete dialogs driven by useReminderActions().
export default function ReminderDialogs({ actions }) {
  return (
    <>
      {actions.editing && <EditReminderModal reminder={actions.editing} onClose={actions.closeEdit} />}
      {actions.deleting && (
        <ConfirmDialog
          title="למחוק את התזכורת?"
          message={`"${actions.deleting.task}" תימחק לצמיתות.`}
          onConfirm={actions.confirmDelete}
          onCancel={actions.cancelDelete}
        />
      )}
    </>
  );
}
