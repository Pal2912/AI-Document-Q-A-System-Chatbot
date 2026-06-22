/**
 * Renders the active toast stack, fixed to the bottom-right of the screen.
 * Mounted once in App.jsx, inside ToastProvider, so it's available everywhere.
 */

import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES = {
  success: "border-success/30 text-success",
  error: "border-error/30 text-error",
  info: "border-ink/15 text-ink-soft dark:border-paper-text/15 dark:text-paper-text-soft",
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || Info;
        return (
          <button
            key={toast.id}
            onClick={() => dismissToast(toast.id)}
            className={`flex items-start gap-3 rounded-lg border bg-paper-raised px-4 py-3 text-left text-sm shadow-lg shadow-ink/5 transition-all animate-in dark:bg-ink-bg-raised dark:shadow-black/20 ${STYLES[toast.type] || STYLES.info}`}
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <span className="flex-1 text-ink dark:text-paper-text">{toast.message}</span>
            <X size={16} className="mt-0.5 shrink-0 opacity-50" />
          </button>
        );
      })}
    </div>
  );
}
