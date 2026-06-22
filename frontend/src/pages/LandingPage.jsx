import { Link } from "react-router-dom";
import { Upload, MessageSquare, Quote, FileText, Sparkles, Lock } from "lucide-react";
import Navbar from "../components/layout/Navbar";

const FEATURES = [
  {
    icon: Upload,
    title: "Upload any PDF",
    description: "Contracts, research papers, reports — drop in multiple documents and they're ready in seconds.",
  },
  {
    icon: MessageSquare,
    title: "Ask in plain language",
    description: "No special syntax. Ask the way you'd ask a colleague who actually read the whole thing.",
  },
  {
    icon: Quote,
    title: "Every answer, cited",
    description: "Click any citation to see the exact page and excerpt it came from. Nothing is taken on faith.",
  },
];

const STEPS = [
  { number: "01", title: "Upload", description: "Drop in one or more PDFs." },
  { number: "02", title: "Ask", description: "Chat naturally about what's inside." },
  { number: "03", title: "Verify", description: "Trace every answer back to its source page." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper dark:bg-ink-bg">
      <Navbar />

      {/* Hero */}
      <section className="px-6 pt-12 pb-20 sm:px-10 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-bg px-3 py-1 text-xs font-medium text-accent dark:bg-accent-bg-dark dark:text-accent-soft">
            <Sparkles size={12} />
            Grounded answers, not guesses
          </div>
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl dark:text-paper-text">
            Ask your documents anything.
            <br />
            Get answers you can trace.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-soft sm:text-lg dark:text-paper-text-soft">
            Upload PDFs and chat with them in plain language. Every response
            cites the exact page it came from, so you never have to wonder
            where an answer came from.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="w-full rounded-md bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft sm:w-auto dark:bg-paper-text dark:text-ink-bg dark:hover:bg-paper-text-soft"
            >
              Get started — it's free
            </Link>
            <Link
              to="/login"
              className="w-full rounded-md border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink/5 sm:w-auto dark:border-paper-text/20 dark:text-paper-text dark:hover:bg-paper-text/10"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Chat preview mockup */}
        <div className="mx-auto mt-14 max-w-2xl overflow-hidden rounded-xl border border-border-light bg-paper-raised shadow-xl shadow-ink/5 dark:border-border-dark dark:bg-ink-bg-raised dark:shadow-black/30">
          <div className="flex items-center gap-2 border-b border-border-light px-4 py-3 dark:border-border-dark">
            <FileText size={14} className="text-ink-faint dark:text-paper-text-faint" />
            <span className="font-mono text-xs text-ink-faint dark:text-paper-text-faint">
              vendor_agreement_2026.pdf
            </span>
          </div>
          <div className="flex flex-col gap-4 p-5">
            <div className="flex justify-end">
              <div className="max-w-[75%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-sm text-paper dark:bg-paper-text dark:text-ink-bg">
                What's the notice period to terminate this contract?
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-bg dark:bg-accent-bg-dark">
                <Sparkles size={14} className="text-accent" />
              </div>
              <div className="flex-1">
                <div className="rounded-2xl rounded-tl-md bg-paper px-4 py-2.5 text-sm text-ink dark:bg-ink-bg dark:text-paper-text">
                  Either party must give <strong>90 days' written notice</strong>{" "}
                  before the renewal date to terminate.
                </div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-accent/25 bg-accent-bg px-3 py-1.5 text-xs font-medium text-accent dark:bg-accent-bg-dark dark:text-accent-soft">
                  <FileText size={12} />
                  vendor_agreement_2026.pdf · p.14
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border-light bg-paper-raised px-6 py-16 sm:px-10 dark:border-border-dark dark:bg-ink-bg-raised">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-bg dark:bg-accent-bg-dark">
                  <Icon size={18} className="text-accent" />
                </div>
                <h3 className="mb-1.5 font-display text-lg text-ink dark:text-paper-text">
                  {title}
                </h3>
                <p className="text-sm text-ink-soft dark:text-paper-text-soft">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center font-display text-2xl text-ink dark:text-paper-text">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map(({ number, title, description }) => (
              <div key={number} className="text-center">
                <p className="mb-2 font-mono text-sm text-accent">{number}</p>
                <h3 className="mb-1.5 font-display text-lg text-ink dark:text-paper-text">
                  {title}
                </h3>
                <p className="text-sm text-ink-soft dark:text-paper-text-soft">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust footer note */}
      <section className="border-t border-border-light px-6 py-10 sm:px-10 dark:border-border-dark">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-sm text-ink-faint dark:text-paper-text-faint">
            <Lock size={14} />
            Your documents are private and only accessible to your account.
          </div>
        </div>
      </section>

      <footer className="border-t border-border-light px-6 py-6 text-center text-xs text-ink-faint sm:px-10 dark:border-border-dark dark:text-paper-text-faint">
        RAG Chatbot — built as a learning project.
      </footer>
    </div>
  );
}
