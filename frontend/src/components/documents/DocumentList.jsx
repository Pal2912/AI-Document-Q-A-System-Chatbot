import { FileText } from "lucide-react";
import DocumentCard from "./DocumentCard";

export default function DocumentList({ documents, onDelete }) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-light py-12 text-center dark:border-border-dark">
        <FileText size={28} className="text-ink-faint dark:text-paper-text-faint" />
        <p className="text-sm text-ink-faint dark:text-paper-text-faint">
          No documents yet. Upload a PDF to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} onDelete={onDelete} />
      ))}
    </div>
  );
}
