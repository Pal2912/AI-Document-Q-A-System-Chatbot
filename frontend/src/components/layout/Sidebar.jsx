/**
 * Persistent left sidebar for all protected pages (dashboard, documents,
 * chat). Shows nav links, the current user, a theme toggle, and logout.
 */

import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, MessageSquare, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useToast } from "../../hooks/useToast";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/chat", label: "Chat", icon: MessageSquare },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    showToast("Logged out successfully.", "info");
    navigate("/login");
  }

  const initials = (user?.full_name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border-light bg-paper-raised dark:border-border-dark dark:bg-ink-bg-raised">
      <div className="flex items-center gap-2 px-5 py-5">
        <FileText size={20} className="text-accent" />
        <span className="font-display text-base text-ink dark:text-paper-text">
          RAG Chatbot
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent-bg text-accent dark:bg-accent-bg-dark dark:text-accent-soft"
                  : "text-ink-soft hover:bg-ink/5 dark:text-paper-text-soft dark:hover:bg-paper-text/10"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border-light px-3 py-4 dark:border-border-dark">
        <button
          onClick={toggleTheme}
          className="mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 dark:text-paper-text-soft dark:hover:bg-paper-text/10"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>

        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-ink dark:text-paper-text">
              {user?.full_name}
            </p>
            <p className="truncate text-xs text-ink-faint dark:text-paper-text-faint">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="shrink-0 rounded-md p-1.5 text-ink-faint transition-colors hover:bg-error/10 hover:text-error dark:text-paper-text-faint"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
