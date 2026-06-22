/**
 * Renders a single message bubble. User messages are right-aligned, plain
 * text. Assistant messages are left-aligned, rendered as markdown (Gemini
 * often returns markdown formatting like lists/bold), with source citations
 * underneath once available, and a typing indicator while streaming with
 * no content yet.
 */

import ReactMarkdown from "react-markdown";
import { Sparkles } from "lucide-react";
import TypingIndicator from "./TypingIndicator";
import SourceCitation from "./SourceCitation";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-in">
        <div className="max-w-[75%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-sm text-paper dark:bg-paper-text dark:text-ink-bg">
          {message.content}
        </div>
      </div>
    );
  }

  const showTyping = message.isStreaming && !message.content;

  return (
    <div className="flex gap-3 animate-in">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-bg dark:bg-accent-bg-dark">
        <Sparkles size={14} className="text-accent" />
      </div>
      <div className="max-w-[80%] flex-1">
        <div className="rounded-2xl rounded-tl-md bg-paper-raised px-4 py-2.5 text-sm text-ink dark:bg-ink-bg-raised dark:text-paper-text">
          {showTyping ? (
            <TypingIndicator />
          ) : (
            <div className="prose-chat">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5">
            {message.sources.map((source, i) => (
              <SourceCitation key={i} source={source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
