import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let bgStyle = 'bg-white border-[#E3EAF4] text-navy-900 shadow-soft-lg';
        let iconColor = 'text-brand-500';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-rose-500';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'text-amber-500';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'text-brand-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl border ${bgStyle} animate-slide-up transition-all`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
            <p className="text-sm font-medium text-slate-800 flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
