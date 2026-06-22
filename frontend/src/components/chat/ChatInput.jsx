/**
 * Message input box. Auto-grows with content (up to a max height), submits
 * on Enter (Shift+Enter for a newline, matching the universal chat-app
 * convention), and swaps the send button for a stop button while a
 * response is streaming.
 */

import { useState, useRef } from "react";
import { ArrowUp, Square } from "lucide-react";

export default function ChatInput({ onSend, isSending, onStop, disabled }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  function handleInput(e) {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isSending || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 px-4 py-3 sm:px-6">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder={disabled ? "Select a document to start chatting" : "Ask a question about your document..."}
        className="max-h-40 flex-1 resize-none rounded-xl border border-border-light bg-paper-raised px-4 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent disabled:opacity-60 dark:border-border-dark dark:bg-ink-bg-raised dark:text-paper-text dark:placeholder:text-paper-text-faint"
      />
      {isSending ? (
        <button
          type="button"
          onClick={onStop}
          title="Stop generating"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-ink-soft dark:bg-paper-text dark:text-ink-bg"
        >
          <Square size={14} fill="currentColor" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          title="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-ink-soft disabled:opacity-30 dark:bg-paper-text dark:text-ink-bg"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </form>
  );
}
