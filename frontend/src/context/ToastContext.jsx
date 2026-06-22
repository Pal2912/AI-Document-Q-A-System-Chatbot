/**
 * ToastProvider — app-wide toast notifications (success / error / info).
 *
 * Usage from any component: const { showToast } = useToast();
 *   showToast("Document uploaded", "success");
 *   showToast("Something went wrong", "error");
 *
 * Toasts auto-dismiss after `duration` ms (default 4s) and can also be
 * dismissed manually by clicking them. Rendered via ToastContainer (a
 * separate component, mounted once near the root of the app) so the
 * visual presentation stays decoupled from the state logic here.
 */

import { useState, useCallback, useRef } from "react";
import { ToastContext } from "./toast-context";

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);

      const timeoutId = setTimeout(() => dismissToast(id), duration);
      timeoutsRef.current.set(id, timeoutId);

      return id;
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}
