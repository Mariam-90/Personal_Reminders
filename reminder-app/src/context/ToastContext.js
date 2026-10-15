import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useI18n } from './I18nContext';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { t } = useI18n();
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((item) => item.id !== id)), []);

  // toast('Saved', { type: 'success' | 'error' | 'info', action: { label, onClick } })
  const toast = useCallback(
    (message, { type = 'success', action, duration = 4500 } = {}) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { id, message, type, action }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((item) => (
          <div key={item.id} className={`toast toast-${item.type}`}>
            <span>{item.message}</span>
            {item.action && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  item.action.onClick();
                  dismiss(item.id);
                }}
              >
                {item.action.label}
              </button>
            )}
            <button type="button" className="toast-close" aria-label={t('toast.close')} onClick={() => dismiss(item.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
