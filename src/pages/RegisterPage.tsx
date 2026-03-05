import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, UserRound, UserPlus } from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";

const MAIN_ROUTE = "/projects/mad-dogs-portal/board";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email.trim(), name.trim(), password);
      navigate(MAIN_ROUTE, { replace: true });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Registration failed";
      setError(message === "Failed to fetch" ? "Cannot reach API server. Check backend and Vite proxy settings." : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-3 sm:p-4 lg:p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
        <p className="pt-2 text-sm text-slate-600">Register to start managing projects and tasks.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1.5 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <UserRound className="h-4 w-4 text-slate-500" />
              Name
            </span>
            <Input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Prod User"
              disabled={isSubmitting}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <Mail className="h-4 w-4 text-slate-500" />
              Email
            </span>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="prod.user@test.local"
              disabled={isSubmitting}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 inline-flex items-center gap-2 text-sm font-medium text-slate-700">Password</span>
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="StrongPass123"
              disabled={isSubmitting}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 inline-flex items-center gap-2 text-sm font-medium text-slate-700">Confirm password</span>
            <Input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat password"
              disabled={isSubmitting}
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" variant="primary" className="h-10 w-full" disabled={isSubmitting}>
            <UserPlus className="h-4 w-4" />
            {isSubmitting ? "Creating account..." : "Register"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-medium text-blue-600 hover:text-blue-700" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
