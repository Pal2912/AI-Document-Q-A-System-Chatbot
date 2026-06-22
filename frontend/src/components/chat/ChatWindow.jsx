/**
 * Scrollable message list. Auto-scrolls to the bottom whenever a new
 * message is added or the streaming content grows, so the conversation
 * always stays anchored to the latest content (standard chat UX).
 */

import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import MessageBubble from "./MessageBubble";
import Loader from "../common/Loader";

export default function ChatWindow({ messages, isLoadingHistory }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (isLoadingHistory) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader size={24} />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <MessageSquare size={28} className="text-ink-faint dark:text-paper-text-faint" />
        <p className="text-sm text-ink-faint dark:text-paper-text-faint">
          Ask anything about the selected document(s).
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-6 sm:px-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
