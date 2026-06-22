import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PanelLeft } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import ChatInput from "../components/chat/ChatInput";
import NewChatPicker from "../components/chat/NewChatPicker";
import Loader from "../components/common/Loader";
import { useChat } from "../hooks/useChat";
import { useDocuments } from "../hooks/useDocuments";
import { useToast } from "../hooks/useToast";
import * as chatService from "../services/chatService";

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { documents, isLoading: documentsLoading } = useDocuments();

  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [mobileChatListOpen, setMobileChatListOpen] = useState(false);

  const { messages, isLoadingHistory, isSending, sendMessage, stopGenerating } = useChat(chatId);

  const refetchChats = useCallback(async () => {
    const data = await chatService.listChats();
    setChats(data.chats);
    return data.chats;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      await refetchChats();
      if (isMounted) setChatsLoading(false);
    }
    load();

    return () => {
      isMounted = false;
    };
  }, [refetchChats]);

  async function handleCreateChat(documentIds) {
    setIsCreatingChat(true);
    try {
      const chat = await chatService.createChat(documentIds);
      await refetchChats();
      setMobileChatListOpen(false);
      navigate(`/chat/${chat.id}`);
    } catch {
      showToast("Couldn't start a new chat. Please try again.", "error");
    } finally {
      setIsCreatingChat(false);
    }
  }

  async function handleDeleteChat(id) {
    try {
      await chatService.deleteChat(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (id === chatId) navigate("/chat");
      showToast("Chat deleted.", "success");
    } catch {
      showToast("Couldn't delete chat.", "error");
    }
  }

  async function handleSend(content) {
    await sendMessage(content);
    // Refresh the sidebar once so the auto-generated title (set from the
    // first message server-side — see chat_service.py) shows up without
    // needing a manual refresh.
    refetchChats();
  }

  // Close the mobile chat-list overlay directly wherever we navigate to a
  // (possibly new) chat, rather than synchronizing it via a useEffect on
  // chatId — the navigation actions below are the actual source of truth
  // for "the active chat changed", so there's no separate external state
  // to synchronize with.

  return (
    <DashboardLayout>
      <div className="relative flex h-full">
        {/* Desktop: always-visible chat list */}
        <div className="hidden md:flex">
          {chatsLoading ? (
            <div className="flex w-72 shrink-0 items-center justify-center border-r border-border-light dark:border-border-dark">
              <Loader />
            </div>
          ) : (
            <ChatSidebar chats={chats} activeChatId={chatId} onDeleteChat={handleDeleteChat} />
          )}
        </div>

        {/* Mobile: slide-over chat list, toggled by the button below */}
        {mobileChatListOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div
              className="absolute inset-0 bg-ink/40"
              onClick={() => setMobileChatListOpen(false)}
            />
            <div className="absolute inset-y-0 left-0">
              <ChatSidebar
                chats={chats}
                activeChatId={chatId}
                onDeleteChat={handleDeleteChat}
                onSelectChat={() => setMobileChatListOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col">
          {/* Mobile-only bar to reveal the chat list */}
          <div className="flex items-center gap-2 border-b border-border-light px-4 py-2.5 md:hidden dark:border-border-dark">
            <button
              onClick={() => setMobileChatListOpen(true)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-soft hover:bg-ink/5 dark:text-paper-text-soft dark:hover:bg-paper-text/10"
            >
              <PanelLeft size={16} />
              Conversations
            </button>
          </div>

          {!chatId ? (
            documentsLoading ? (
              <Loader className="h-full" />
            ) : (
              <NewChatPicker
                documents={documents}
                onCreateChat={handleCreateChat}
                isCreating={isCreatingChat}
              />
            )
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                <ChatWindow messages={messages} isLoadingHistory={isLoadingHistory} />
              </div>
              <div className="border-t border-border-light dark:border-border-dark">
                <ChatInput onSend={handleSend} isSending={isSending} onStop={stopGenerating} />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
