/**
 * Single document row. Status badge reflects the backend's three states
 * (processing/ready/failed — see Document.status in the backend model),
 * with processing shown as an animated pulse so the live-polling update
 * (useDocuments.js) feels responsive rather than static.
 */

import { useState } from "react";
import { FileText, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { formatDate, formatFileSize } from "../../utils/formatDate";
import Modal from "../common/Modal";
import Button from "../common/Button";

const STATUS_CONFIG = {
  processing: {
    label: "Processing",
    icon: Loader2,
    className: "text-ink-faint dark:text-paper-text-faint",
    spin: true,
  },
  ready: {
    label: "Ready",
    icon: CheckCircle2,
    className: "text-success",
    spin: false,
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    className: "text-error",
    spin: false,
  },
};

export default function DocumentCard({ document, onDelete }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const status = STATUS_CONFIG[document.status] || STATUS_CONFIG.processing;
  const StatusIcon = status.icon;

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await onDelete(document.id);
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border-light bg-paper-raised px-4 py-3.5 transition-colors hover:border-accent/30 sm:gap-4 dark:border-border-dark dark:bg-ink-bg-raised">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-bg dark:bg-accent-bg-dark">
          <FileText size={18} className="text-accent" />
        </div>

        <div className="min-w-0 flex-1 basis-40">
          <p className="truncate text-sm font-medium text-ink dark:text-paper-text">
            {document.filename}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-xs text-ink-faint dark:text-paper-text-faint">
            <span>{formatFileSize(document.file_size_bytes)}</span>
            {document.page_count && (
              <>
                <span>·</span>
                <span>{document.page_count} pages</span>
              </>
            )}
            <span>·</span>
            <span>{formatDate(document.created_at)}</span>
          </p>
        </div>

        <div className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${status.className}`}>
          <StatusIcon size={14} className={status.spin ? "animate-spin" : ""} />
          {status.label}
        </div>

        <button
          onClick={() => setConfirmOpen(true)}
          title="Delete document"
          className="shrink-0 rounded-md p-2 text-ink-faint transition-colors hover:bg-error/10 hover:text-error dark:text-paper-text-faint"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete document?"
      >
        <p className="text-sm text-ink-soft dark:text-paper-text-soft">
          This will permanently delete <strong>{document.filename}</strong> and
          remove it from any chats that reference it. This can't be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={isDeleting} onClick={handleConfirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
