/**
 * Public navbar for the landing page only (protected pages use Sidebar
 * instead). Includes the theme toggle since unauthenticated visitors
 * should be able to preview dark mode before signing up.
 */

import { Link } from "react-router-dom";
import { FileText, Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between px-6 py-5 sm:px-10">
      <Link to="/" className="flex items-center gap-2">
        <FileText size={20} className="text-accent" />
        <span className="font-display text-lg text-ink dark:text-paper-text">
          RAG Chatbot
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-md p-2 text-ink-soft transition-colors hover:bg-ink/5 dark:text-paper-text-soft dark:hover:bg-paper-text/10"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <Link
          to="/login"
          className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:inline dark:text-paper-text-soft dark:hover:text-paper-text"
        >
          Log in
        </Link>
        <Link
          to="/signup"
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-soft dark:bg-paper-text dark:text-ink-bg dark:hover:bg-paper-text-soft"
        >
          Sign up
        </Link>
      </div>
    </header>
  );
}
