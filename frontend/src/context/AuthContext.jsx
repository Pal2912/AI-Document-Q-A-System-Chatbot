/**
 * AuthContext — provides the current user, auth state, and login/signup/
 * logout functions to the entire app via React Context.
 *
 * On mount, if a token exists in localStorage, we call GET /api/auth/me to
 * verify it's still valid and load the user — this is what makes a page
 * refresh keep you logged in instead of bouncing you to /login every time.
 */

import { useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService";
import { TOKEN_STORAGE_KEY } from "../utils/constants";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true until we've checked for an existing session

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        // Token was invalid/expired; the Axios interceptor already cleared it.
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const signup = useCallback(async (fullName, email, password) => {
    const data = await authService.signup({ fullName, email, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the server call fails (e.g. token already expired), we
      // still want to clear local state so the user is logged out client-side.
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
