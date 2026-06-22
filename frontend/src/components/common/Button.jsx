/**
 * Shared Button component. Variants:
 *   primary   -> solid ink/paper-text background, main CTAs
 *   secondary -> outlined, lower emphasis
 *   ghost     -> no border/background until hover, lowest emphasis
 *
 * `isLoading` shows a spinner and disables the button — used for any
 * action that triggers a network request (login, signup, upload, etc.)
 * so the user gets clear feedback and can't double-submit.
 */

const VARIANTS = {
  primary:
    "bg-ink text-paper hover:bg-ink-soft dark:bg-paper-text dark:text-ink-bg dark:hover:bg-paper-text-soft",
  secondary:
    "border border-ink/20 text-ink hover:bg-ink/5 dark:border-paper-text/20 dark:text-paper-text dark:hover:bg-paper-text/10",
  ghost:
    "text-ink-soft hover:bg-ink/5 dark:text-paper-text-soft dark:hover:bg-paper-text/10",
  danger: "bg-error text-white hover:bg-error/90",
};

export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  disabled = false,
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
