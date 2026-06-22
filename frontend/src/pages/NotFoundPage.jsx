import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper dark:bg-ink-bg">
      <h1 className="font-display text-5xl text-ink dark:text-paper-text">404</h1>
      <p className="text-ink-soft dark:text-paper-text-soft">
        This page doesn't exist.
      </p>
      <Link to="/" className="text-accent underline">
        Go home
      </Link>
    </div>
  );
}
