/**
 * Signup form. Validation rules mirror the backend's UserSignup schema
 * (full_name min 2 chars, password min 6 chars) so the person sees a
 * helpful inline error before ever hitting the network, instead of
 * discovering the rule only from a 422 response.
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import Input from "../common/Input";
import Button from "../common/Button";
import { extractErrorMessage } from "../../utils/errorHandling";

export default function SignupForm() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const next = {};
    if (form.fullName.trim().length < 2) next.fullName = "Name must be at least 2 characters.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signup(form.fullName.trim(), form.email, form.password);
      showToast("Account created. Welcome!", "success");
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
        id="fullName"
        label="Full name"
        autoComplete="name"
        placeholder="Jane Doe"
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        error={errors.fullName}
      />

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
        autoComplete="new-password"
        placeholder="At least 6 characters"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        error={errors.password}
      />

      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Create account
      </Button>

      <p className="text-center text-sm text-ink-soft dark:text-paper-text-soft">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
