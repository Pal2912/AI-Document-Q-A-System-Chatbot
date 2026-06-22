/**
 * Shared modal dialog. Closes on Escape or backdrop click. Used for
 * confirmation dialogs (delete document/chat) and any future dialogs.
 */

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-paper-raised p-6 shadow-xl dark:bg-ink-bg-raised">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink dark:text-paper-text">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-faint hover:bg-ink/5 dark:text-paper-text-faint dark:hover:bg-paper-text/10"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
