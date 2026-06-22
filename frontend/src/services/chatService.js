/**
 * Chat API calls. Mirrors backend/app/routes/chat_routes.py.
 *
 * Most calls go through the shared `api` (Axios) instance, EXCEPT sending a
 * message — that endpoint streams its response body chunk-by-chunk, and
 * Axios doesn't give convenient access to a streaming response body in the
 * browser. The native `fetch` API does, via `response.body` as a
 * ReadableStream, so `sendMessageStream` is written with fetch directly
 * (manually attaching the auth header, since it bypasses our Axios
 * interceptor).
 */

import api from "./api";
import { API_URL, TOKEN_STORAGE_KEY } from "../utils/constants";

export async function createChat(documentIds, title) {
  const res = await api.post("/api/chats", { document_ids: documentIds, title });
  return res.data;
}

export async function listChats() {
  const res = await api.get("/api/chats");
  return res.data; // { chats: [...], total: n }
}

export async function getChatHistory(chatId) {
  const res = await api.get(`/api/chats/${chatId}`);
  return res.data; // { chat_id, title, messages: [...] }
}

export async function deleteChat(chatId) {
  const res = await api.delete(`/api/chats/${chatId}`);
  return res.data;
}

/**
 * Sends a message and streams the assistant's response back.
 *
 * @param {string} chatId
 * @param {string} content - the user's message text
 * @param {(chunk: string) => void} onChunk - called with each new piece of
 *        text as it arrives, so the caller can append it to the UI live
 * @param {AbortSignal} [signal] - optional, lets the caller cancel mid-stream
 *        (e.g. if the user navigates away or clicks "stop generating")
 * @returns {Promise<string>} the full assembled response text once done
 */
export async function sendMessageStream(chatId, content, onChunk, signal) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  const response = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content }),
    signal,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.location.href = "/login";
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunkText = decoder.decode(value, { stream: true });
    fullText += chunkText;
    onChunk(chunkText);
  }

  return fullText;
}
