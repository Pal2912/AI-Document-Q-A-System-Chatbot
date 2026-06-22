/**
 * Shared text input with a label and inline validation error. Used by
 * LoginForm, SignupForm, and any later form (e.g. settings).
 */
export default function Input({ label, error, id, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink dark:text-paper-text">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-md border bg-paper-raised px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent dark:bg-ink-bg-raised dark:text-paper-text dark:placeholder:text-paper-text-faint ${
          error
            ? "border-error"
            : "border-border-light dark:border-border-dark"
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
