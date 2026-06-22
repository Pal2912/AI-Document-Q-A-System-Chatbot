/**
 * Shared shell for protected pages: sidebar (desktop) + a simple top bar
 * with a hamburger menu (mobile, since the sidebar is hidden under
 * `lg:flex` and full-screen real estate matters most on small screens).
 */

import { useState } from "react";
import { Menu, X, FileText } from "lucide-react";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-paper dark:bg-ink-bg">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar (slide-over) */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border-light bg-paper-raised px-4 py-3 lg:hidden dark:border-border-dark dark:bg-ink-bg-raised">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-accent" />
            <span className="font-display text-sm text-ink dark:text-paper-text">
              RAG Chatbot
            </span>
          </div>
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="rounded-md p-1.5 text-ink-soft dark:text-paper-text-soft"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
