import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { formatDate } from "../../utils/formatDate";

export default function RecentChats({ chats }) {
  if (chats.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-ink-faint dark:text-paper-text-faint">
        No conversations yet. Start one from the Chat page.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {chats.map((chat) => (
        <Link
          key={chat.id}
          to={`/chat/${chat.id}`}
          className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-ink/5 dark:hover:bg-paper-text/10"
        >
          <MessageSquare size={16} className="shrink-0 text-ink-faint dark:text-paper-text-faint" />
          <span className="flex-1 truncate text-sm text-ink dark:text-paper-text">
            {chat.title}
          </span>
          <span className="shrink-0 font-mono text-xs text-ink-faint dark:text-paper-text-faint">
            {formatDate(chat.created_at)}
          </span>
        </Link>
      ))}
      <Link to="/chat" className="mt-2 px-2 text-sm font-medium text-accent hover:underline">
        View all chats →
      </Link>
    </div>
  );
}
