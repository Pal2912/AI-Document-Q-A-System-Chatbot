/**
 * useChat — manages a single chat's message list, including the streaming
 * send flow.
 *
 * Streaming UX design: as soon as the user sends a message, we optimistically
 * append it to the list AND append a placeholder assistant message with
 * `isStreaming: true`. Each incoming chunk from chatService.sendMessageStream
 * is appended to that placeholder's content in place, so the message bubble
 * grows token-by-token. Once the stream ends, `isStreaming` is cleared. If
 * the request fails entirely, the placeholder is replaced with an error
 * message instead of being left stuck mid-stream.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import * as chatService from "../services/chatService";

let localIdCounter = 0;

export function useChat(chatId) {
  const [messages, setMessages] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      if (!chatId) {
        if (isMounted) {
          setMessages([]);
          setIsLoadingHistory(false);
        }
        return;
      }

      setIsLoadingHistory(true);
      try {
        const data = await chatService.getChatHistory(chatId);
        if (isMounted) setMessages(data.messages);
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [chatId]);

  const sendMessage = useCallback(
    async (content) => {
      if (!chatId || !content.trim()) return;

      const userMessage = {
        id: `local-${++localIdCounter}`,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };
      const assistantPlaceholderId = `local-${++localIdCounter}`;
      const assistantPlaceholder = {
        id: assistantPlaceholderId,
        role: "assistant",
        content: "",
        sources: [],
        isStreaming: true,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
      setIsSending(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await chatService.sendMessageStream(
          chatId,
          content,
          (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantPlaceholderId ? { ...m, content: m.content + chunk } : m
              )
            );
          },
          controller.signal
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholderId
                ? { ...m, content: "Sorry, something went wrong generating a response. Please try again." }
                : m
            )
          );
        }
      } finally {
        setIsSending(false);
        abortRef.current = null;

        // Source citations are only computed and saved server-side AFTER
        // the stream finishes (see backend chat_service.py) — they're not
        // part of the token stream itself. So once streaming ends, we
        // re-fetch the real persisted history to pick up: the real message
        // IDs (replacing our temporary local- ids), and the source
        // citations for the assistant's reply.
        try {
          const data = await chatService.getChatHistory(chatId);
          setMessages(data.messages);
        } catch {
          // If this refetch fails, just stop showing the streaming cursor;
          // the locally-built content the user already saw stays as-is.
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantPlaceholderId ? { ...m, isStreaming: false } : m))
          );
        }
      }
    },
    [chatId]
  );

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isLoadingHistory, isSending, sendMessage, stopGenerating };
}
