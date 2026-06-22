/**
 * A single stat card (e.g. "Total Documents: 12") for the dashboard's
 * top summary row.
 */
export default function StatsCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border-light bg-paper-raised px-5 py-5 dark:border-border-dark dark:bg-ink-bg-raised">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-bg dark:bg-accent-bg-dark">
        <Icon size={20} className="text-accent" />
      </div>
      <div>
        <p className="font-display text-2xl text-ink dark:text-paper-text">{value}</p>
        <p className="text-sm text-ink-faint dark:text-paper-text-faint">{label}</p>
      </div>
    </div>
  );
}
