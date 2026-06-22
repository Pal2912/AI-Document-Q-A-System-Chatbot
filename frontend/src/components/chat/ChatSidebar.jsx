/**
 * Sidebar listing the user's past chats (within the chat page itself,
 * distinct from the app-wide Sidebar in layout/). Clicking a chat
 * navigates to it; "New chat" starts the document-picker flow.
 */

import { Link, useNavigate } from "react-router-dom";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { formatDate } from "../../utils/formatDate";

export default function ChatSidebar({ chats, activeChatId, onDeleteChat, onSelectChat }) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-r border-border-light bg-paper-raised dark:border-border-dark dark:bg-ink-bg-raised">
      <div className="p-3">
        <button
          onClick={() => {
            onSelectChat?.();
            navigate("/chat");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-border-light px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink/5 dark:border-border-dark dark:text-paper-text dark:hover:bg-paper-text/10"
        >
          <Plus size={16} />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {chats.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-ink-faint dark:text-paper-text-faint">
            No conversations yet.
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 rounded-md px-3 py-2.5 transition-colors ${
                  chat.id === activeChatId
                    ? "bg-accent-bg dark:bg-accent-bg-dark"
                    : "hover:bg-ink/5 dark:hover:bg-paper-text/10"
                }`}
              >
                <Link
                  to={`/chat/${chat.id}`}
                  onClick={() => onSelectChat?.()}
                  className="flex min-w-0 flex-1 items-center gap-2.5"
                >
                  <MessageSquare
                    size={15}
                    className={`shrink-0 ${
                      chat.id === activeChatId
                        ? "text-accent"
                        : "text-ink-faint dark:text-paper-text-faint"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm ${
                        chat.id === activeChatId
                          ? "font-medium text-accent dark:text-accent-soft"
                          : "text-ink dark:text-paper-text"
                      }`}
                    >
                      {chat.title}
                    </p>
                    <p className="truncate text-xs text-ink-faint dark:text-paper-text-faint">
                      {formatDate(chat.created_at)}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDeleteChat(chat.id);
                  }}
                  className="shrink-0 rounded p-1 text-ink-faint opacity-0 transition-opacity hover:bg-error/10 hover:text-error group-hover:opacity-100 dark:text-paper-text-faint"
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
