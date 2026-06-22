/**
 * Central Axios instance used by every service file (authService,
 * documentService, chatService, dashboardService).
 *
 * Two interceptors do the heavy lifting:
 *   - REQUEST interceptor: attaches the JWT (if present) to every outgoing
 *     request's Authorization header, so individual service functions never
 *     need to think about auth headers themselves.
 *   - RESPONSE interceptor: if the backend ever returns 401 (token expired
 *     or invalid), this clears the stored token and redirects to /login —
 *     a single global "session expired" handler instead of repeating that
 *     logic in every component that makes a request.
 */

import axios from "axios";
import { API_URL, TOKEN_STORAGE_KEY } from "../utils/constants";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      // Avoid redirect loops if we're already on the login/signup page.
      const publicPaths = ["/login", "/signup"];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
