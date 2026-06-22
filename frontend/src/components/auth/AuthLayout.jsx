/**
 * Shared visual frame for Login and Signup pages.
 *
 * Design choice: split layout instead of a centered generic card. The left
 * panel holds the actual form; the right panel (hidden on mobile) carries
 * the product's visual identity — an excerpt-and-citation motif that
 * previews what the chat experience actually looks like, so the auth
 * screen itself starts selling the product instead of being a blank
 * gatekeeper page.
 */

import { Link } from "react-router-dom";
import { FileText, Quote } from "lucide-react";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-paper dark:bg-ink-bg">
      {/* Form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-10 inline-flex items-center gap-2">
            <FileText size={22} className="text-accent" />
            <span className="font-display text-lg text-ink dark:text-paper-text">
              RAG Chatbot
            </span>
          </Link>

          <h1 className="mb-2 font-display text-3xl text-ink dark:text-paper-text">
            {title}
          </h1>
          {subtitle && (
            <p className="mb-8 text-sm text-ink-soft dark:text-paper-text-soft">
              {subtitle}
            </p>
          )}

          {children}
        </div>
      </div>

      {/* Visual panel — hidden on small screens */}
      <div className="relative hidden w-1/2 items-center justify-center bg-ink-bg p-16 lg:flex">
        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(244,241,234,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(244,241,234,0.6) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative max-w-md">
          <p className="mb-6 font-mono text-xs uppercase tracking-wider text-paper-text-faint">
            Excerpt — page 14
          </p>
          <blockquote className="mb-6 font-display text-2xl leading-snug text-paper-text">
            "The termination clause requires 90 days' written notice prior
            to the renewal date specified in Section 4.2."
          </blockquote>
          <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent-bg-dark px-4 py-3">
            <Quote size={16} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-sm text-accent-soft">
              Cited from <span className="font-medium">contract_2026.pdf</span>,
              page 14 — ask anything, get the receipt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
