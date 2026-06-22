import AuthLayout from "../components/auth/AuthLayout";
import SignupForm from "../components/auth/SignupForm";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function SignupPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Upload documents and start asking questions in minutes."
    >
      <SignupForm />
    </AuthLayout>
  );
}
