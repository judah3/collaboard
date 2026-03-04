import type { AuthSession } from "@/features/auth/types";

const STORAGE_KEY = "pm_auth_session";

export const saveAuthSession = (session: AuthSession) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const getStoredAuthSession = (): AuthSession | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearStoredAuthSession = () => {
  localStorage.removeItem(STORAGE_KEY);
};