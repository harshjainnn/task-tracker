import { createContext, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const pushToast = ({ type = 'success', message }) => {
    if (!message) return;

    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => removeToast(id), 3500);
  };

  const value = useMemo(() => ({
    success: (message) => pushToast({ type: 'success', message }),
    error: (message) => pushToast({ type: 'error', message }),
    info: (message) => pushToast({ type: 'info', message }),
  }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${
              toast.type === 'error'
                ? 'border-rose-500/30 bg-rose-950/90 text-rose-100'
                : toast.type === 'info'
                  ? 'border-cyan-500/30 bg-cyan-950/90 text-cyan-100'
                  : 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span>{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="text-current opacity-70 hover:opacity-100">
                X
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
