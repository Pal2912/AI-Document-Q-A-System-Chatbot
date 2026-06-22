/**
 * Shared constants used across the app.
 */

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const TOKEN_STORAGE_KEY = "rag_chatbot_token";
export const THEME_STORAGE_KEY = "rag_chatbot_theme";

export const DOCUMENT_STATUS = {
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
};

export const MAX_UPLOAD_SIZE_MB = 20;
