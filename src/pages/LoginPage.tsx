import { LogIn, Mail, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";

type LoginLocationState = {
  from?: string;
};

const MAIN_ROUTE = "/projects/mad-dogs-portal/board";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("you@test.local");
  const [name, setName] = useState("You");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as LoginLocationState | null)?.from ?? MAIN_ROUTE;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !name.trim()) {
      setError("Email and name are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim(), name.trim());
      navigate(from, { replace: true });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Login failed";
      setError(message === "Failed to fetch" ? "Cannot reach API server. Check backend and Vite proxy settings." : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="pt-2 text-sm text-slate-600">Use the dev auth endpoint to access the app.</p>

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
              <UserRound className="h-4 w-4 text-slate-500" />
              Name
            </span>
            <Input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="You"
              disabled={isSubmitting}
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" variant="primary" className="h-10 w-full" disabled={isSubmitting}>
            <LogIn className="h-4 w-4" />
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="h-10 w-full"
            onClick={() => setError("Google login is coming soon.")}
            disabled={isSubmitting}
          >
            Login with Google (Coming soon)
          </Button>
        </form>
      </div>
    </div>
  );
};
