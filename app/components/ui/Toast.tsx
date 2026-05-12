import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const styles: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
    success: { bg: 'bg-green-600', icon: <CheckCircle size={18} /> },
    error:   { bg: 'bg-red-600',   icon: <XCircle size={18} /> },
    info:    { bg: 'bg-blue-600',  icon: <Info size={18} /> },
  };
  const { bg, icon } = styles[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 ${bg} text-white px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-sm`}
    >
      {icon}
      <span className="flex-1 text-sm">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="opacity-70 hover:opacity-100 transition">
        <X size={16} />
      </button>
    </div>
  );
}

let _nextId = 1;
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const showToast = React.useCallback((message: string, type: ToastType = 'info') => {
    const id = _nextId++;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismiss = React.useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, dismiss };
}
