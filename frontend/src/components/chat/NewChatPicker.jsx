/**
 * Shown in the main chat area when no chat is active (i.e. the user
 * clicked "New chat" or navigated to /chat directly). Lets them pick one
 * or more READY documents to scope the new conversation to — chats can't
 * be created against documents still processing or failed (enforced both
 * here and, redundantly, by the backend's create_chat validation).
 */

import { useState } from "react";
import { FileText, CheckCircle2, MessageSquarePlus } from "lucide-react";
import Button from "../common/Button";

export default function NewChatPicker({ documents, onCreateChat, isCreating }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const readyDocuments = documents.filter((d) => d.status === "ready");

  function toggle(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  if (readyDocuments.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <FileText size={28} className="text-ink-faint dark:text-paper-text-faint" />
        <p className="text-sm text-ink-soft dark:text-paper-text-soft">
          You don't have any ready documents yet.
          <br />
          Upload a PDF from the Documents page to start a chat.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center px-6 py-10">
      <MessageSquarePlus size={28} className="mb-3 text-accent" />
      <h2 className="mb-1 font-display text-xl text-ink dark:text-paper-text">
        Start a new chat
      </h2>
      <p className="mb-6 text-center text-sm text-ink-soft dark:text-paper-text-soft">
        Choose which document(s) to ask questions about.
      </p>

      <div className="mb-6 flex w-full flex-col gap-2">
        {readyDocuments.map((doc) => {
          const isSelected = selectedIds.includes(doc.id);
          return (
            <button
              key={doc.id}
              onClick={() => toggle(doc.id)}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                isSelected
                  ? "border-accent bg-accent-bg dark:bg-accent-bg-dark"
                  : "border-border-light hover:border-accent/40 dark:border-border-dark"
              }`}
            >
              <FileText size={16} className="shrink-0 text-ink-faint dark:text-paper-text-faint" />
              <span className="flex-1 truncate text-sm text-ink dark:text-paper-text">
                {doc.filename}
              </span>
              {isSelected && <CheckCircle2 size={16} className="shrink-0 text-accent" />}
            </button>
          );
        })}
      </div>

      <Button
        onClick={() => onCreateChat(selectedIds)}
        disabled={selectedIds.length === 0}
        isLoading={isCreating}
        className="w-full"
      >
        Start chatting
      </Button>
    </div>
  );
}
