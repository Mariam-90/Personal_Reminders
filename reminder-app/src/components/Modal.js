import React, { useEffect, useRef } from 'react';

export default function Modal({ title, onClose, children, actions }) {
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    ref.current?.querySelector('input, button, textarea, select')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <h2>{title}</h2>
        {children}
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'כן, למחוק', onConfirm, onCancel }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      actions={
        <>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            ביטול
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>{message}</p>
    </Modal>
  );
}
