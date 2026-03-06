import { LogIn, Mail } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { getDefaultRoute } from "@/features/auth/lastVisitedRoute";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";

type LoginLocationState = {
  from?: string;
};

const SAVED_CREDENTIALS_KEY = "pm_saved_login_credentials";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saveCredentials, setSaveCredentials] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as LoginLocationState | null)?.from;

  useEffect(() => {
    const raw = localStorage.getItem(SAVED_CREDENTIALS_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { email?: string; password?: string };
      if (typeof parsed.email === "string") {
        setEmail(parsed.email);
      }
      if (typeof parsed.password === "string") {
        setPassword(parsed.password);
      }
      setSaveCredentials(true);
    } catch {
      localStorage.removeItem(SAVED_CREDENTIALS_KEY);
    }
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      if (saveCredentials) {
        localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify({ email: email.trim(), password }));
      } else {
        localStorage.removeItem(SAVED_CREDENTIALS_KEY);
      }
      const redirectTarget = from ?? getDefaultRoute();
      navigate(redirectTarget, { replace: true });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Login failed";
      setError(message === "Failed to fetch" ? "Cannot reach API server. Check backend and Vite proxy settings." : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-3 sm:p-4 lg:p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="pt-2 text-sm text-slate-600">Sign in to continue to your workspace.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
              placeholder="you@test.local"
              disabled={isSubmitting}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              Password
            </span>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              disabled={isSubmitting}
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
              checked={saveCredentials}
              onChange={(event) => setSaveCredentials(event.target.checked)}
              disabled={isSubmitting}
            />
            Save credentials
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" variant="primary" className="h-10 w-full" disabled={isSubmitting}>
            <LogIn className="h-4 w-4" />
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New here?{" "}
          <Link className="font-medium text-blue-600 hover:text-blue-700" to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};


