import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, loginWithDev, logout as logoutRequest } from "@/features/auth/api";
import { clearStoredAuthSession, getStoredAuthSession, saveAuthSession } from "@/features/auth/storage";
import type { AuthSession, AuthUser } from "@/features/auth/types";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  login: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const hydrateAuth = async () => {
      const stored = getStoredAuthSession();

      if (!stored?.accessToken) {
        setStatus("anonymous");
        return;
      }

      try {
        const user = await getMe(stored.accessToken);
        const nextSession: AuthSession = { ...stored, user };
        setSession(nextSession);
        saveAuthSession(nextSession);
        setStatus("authenticated");
      } catch {
        clearStoredAuthSession();
        setSession(null);
        setStatus("anonymous");
      }
    };

    void hydrateAuth();
  }, []);

  const login = async (email: string, name: string) => {
    const nextSession = await loginWithDev({ email, name });
    setSession(nextSession);
    saveAuthSession(nextSession);
    setStatus("authenticated");
  };

  const logout = async () => {
    if (session?.accessToken) {
      try {
        await logoutRequest(session.accessToken, session.refreshToken);
      } catch {
        // Clear local auth state even if remote logout fails.
      }
    }

    clearStoredAuthSession();
    setSession(null);
    setStatus("anonymous");
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      login,
      logout
    }),
    [session?.accessToken, session?.user, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};