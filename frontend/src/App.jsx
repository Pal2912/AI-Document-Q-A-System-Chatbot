import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ToastContainer from "./components/common/ToastContainer";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentsPage from "./pages/DocumentsPage";
import ChatPage from "./pages/ChatPage";
import NotFoundPage from "./pages/NotFoundPage";

/**
 * Top-level route map.
 *   /            -> public landing page
 *   /login       -> public
 *   /signup      -> public
 *   /dashboard   -> protected (requires auth)
 *   /documents   -> protected
 *   /chat/:chatId -> protected (chatId optional via :chatId? once added in Phase 9)
 *
 * Provider order matters only in that ToastProvider must wrap everything
 * that might call useToast() (i.e. all of it) — Theme/Auth ordering
 * relative to each other doesn't matter since neither depends on the other.
 */
function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents"
                element={
                  <ProtectedRoute>
                    <DocumentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:chatId?"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
