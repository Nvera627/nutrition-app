/**
 * Toast.jsx
 * Renders the stack of active toast notifications in the bottom-right corner.
 * Place this once inside ToastProvider in App.jsx.
 */

import { useToast } from '../context/ToastContext';

export default function Toast() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
