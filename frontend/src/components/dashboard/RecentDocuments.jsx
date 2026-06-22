import { Link } from "react-router-dom";
import { FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { formatDate } from "../../utils/formatDate";

const STATUS_ICON = {
  ready: { icon: CheckCircle2, className: "text-success" },
  processing: { icon: Loader2, className: "text-ink-faint dark:text-paper-text-faint", spin: true },
  failed: { icon: AlertCircle, className: "text-error" },
};

export default function RecentDocuments({ documents }) {
  if (documents.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-ink-faint dark:text-paper-text-faint">
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {documents.map((doc) => {
        const status = STATUS_ICON[doc.status] || STATUS_ICON.processing;
        const StatusIcon = status.icon;
        return (
          <div key={doc.id} className="flex items-center gap-3 rounded-md px-2 py-2.5">
            <FileText size={16} className="shrink-0 text-ink-faint dark:text-paper-text-faint" />
            <span className="flex-1 truncate text-sm text-ink dark:text-paper-text">
              {doc.filename}
            </span>
            <StatusIcon size={14} className={`shrink-0 ${status.className} ${status.spin ? "animate-spin" : ""}`} />
            <span className="shrink-0 font-mono text-xs text-ink-faint dark:text-paper-text-faint">
              {formatDate(doc.created_at)}
            </span>
          </div>
        );
      })}
      <Link
        to="/documents"
        className="mt-2 px-2 text-sm font-medium text-accent hover:underline"
      >
        View all documents →
      </Link>
    </div>
  );
}
