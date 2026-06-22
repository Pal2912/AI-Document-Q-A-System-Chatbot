/**
 * Source citation chip — the product's signature visual element. Styled
 * like a highlighter tab/sticky note rather than a generic badge, since
 * grounding every answer in a traceable page is the one thing this app
 * does that a plain chatbot doesn't.
 *
 * Clicking expands to show the actual excerpt snippet that was retrieved,
 * so the person can verify the answer against the source without leaving
 * the chat.
 */

import { useState } from "react";
import { FileText, ChevronDown } from "lucide-react";

export default function SourceCitation({ source }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-md border border-accent/25 bg-accent-bg dark:bg-accent-bg-dark">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left"
      >
        <FileText size={13} className="shrink-0 text-accent" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-accent dark:text-accent-soft">
          {source.document_name}
          {source.page_number ? ` · p.${source.page_number}` : ""}
        </span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-accent transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <div className="border-t border-accent/20 px-3 py-2">
          <p className="font-mono text-xs leading-relaxed text-ink-soft dark:text-paper-text-soft">
            "{source.snippet}"
          </p>
        </div>
      )}
    </div>
  );
}
