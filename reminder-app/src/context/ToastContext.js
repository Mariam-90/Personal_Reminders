import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  // toast('נשמר', { type: 'success' | 'error' | 'info', action: { label, onClick } })
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
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.message}</span>
            {t.action && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  t.action.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
            <button type="button" className="toast-close" aria-label="סגירה" onClick={() => dismiss(t.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
