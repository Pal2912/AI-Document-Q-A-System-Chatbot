/**
 * Login form. Handles client-side validation (required fields, basic email
 * shape) and server-side error display (wrong credentials -> shown inline,
 * not just as a toast, since the person needs to see exactly what to fix).
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import Input from "../common/Input";
import Button from "../common/Button";
import { extractErrorMessage } from "../../utils/errorHandling";

export default function LoginForm() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(form.email, form.password);
      showToast("Welcome back!", "success");
      navigate("/dashboard");
    } catch (err) {
      setErrors({ form: extractErrorMessage(err, "Something went wrong. Please try again.") });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {errors.form && (
        <p className="rounded-md bg-error/10 px-3.5 py-2.5 text-sm text-error">
          {errors.form}
        </p>
      )}

      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
      />

      <Input
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        error={errors.password}
      />

      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Log in
      </Button>

      <p className="text-center text-sm text-ink-soft dark:text-paper-text-soft">
        Don't have an account?{" "}
        <Link to="/signup" className="font-medium text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
