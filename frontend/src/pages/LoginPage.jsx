import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to pick up where you left off."
    >
      <LoginForm />
    </AuthLayout>
  );
}
