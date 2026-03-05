import { API_BASE_URL } from "@/shared/config/env";
import type { AuthSession, AuthUser } from "@/features/auth/types";

type DevLoginPayload = {
  email: string;
  name: string;
};

type LocalRegisterPayload = {
  email: string;
  name: string;
  password: string;
};

type LocalLoginPayload = {
  email: string;
  password: string;
};

type GoogleLoginPayload = {
  idToken: string;
};

type JsonRecord = Record<string, unknown>;

const jsonHeaders = {
  "Content-Type": "application/json"
};

const resolvePath = (path: string) => `${API_BASE_URL}${path}`;

const isRecord = (value: unknown): value is JsonRecord => typeof value === "object" && value !== null;

const readString = (record: JsonRecord, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return undefined;
};

const readUser = (record: JsonRecord): AuthUser | undefined => {
  const candidate = isRecord(record.user) ? record.user : record;
  const email = readString(candidate, ["email"]);
  const name = readString(candidate, ["name", "full_name"]);

  if (!email || !name) {
    return undefined;
  }

  return {
    id: readString(candidate, ["id", "user_id"]),
    email,
    name,
    avatarUrl: readString(candidate, ["avatar_url", "avatarUrl"]) ?? null
  };
};

const parseSession = (payload: unknown): AuthSession => {
  if (!isRecord(payload)) {
    throw new Error("Unexpected auth response from server");
  }

  const accessToken = readString(payload, ["access", "access_token", "accessToken", "token"]);

  if (!accessToken) {
    throw new Error("Missing access token in auth response");
  }

  const refreshToken = readString(payload, ["refresh", "refresh_token", "refreshToken"]);
  const user = readUser(payload);

  if (!user) {
    throw new Error("Missing user profile in auth response");
  }

  return {
    accessToken,
    refreshToken,
    user
  };
};

const ensureOk = async (response: Response) => {
  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as JsonRecord;
      const detail = readString(body, ["detail", "message", "error"]);
      throw new Error(detail ?? fallback);
    } catch {
      throw new Error(fallback);
    }
  }
};

export const loginWithDev = async (payload: DevLoginPayload): Promise<AuthSession> => {
  const response = await fetch(resolvePath("/auth/dev/login"), {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
    credentials: "include"
  });

  await ensureOk(response);
  return parseSession(await response.json());
};

export const registerWithLocal = async (payload: LocalRegisterPayload): Promise<AuthSession> => {
  const response = await fetch(resolvePath("/auth/register"), {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
    credentials: "include"
  });

  await ensureOk(response);
  return parseSession(await response.json());
};

export const loginWithLocal = async (payload: LocalLoginPayload): Promise<AuthSession> => {
  const response = await fetch(resolvePath("/auth/login"), {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
    credentials: "include"
  });

  await ensureOk(response);
  return parseSession(await response.json());
};

export const loginWithGoogle = async (payload: GoogleLoginPayload): Promise<AuthSession> => {
  const response = await fetch(resolvePath("/auth/google/login"), {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
    credentials: "include"
  });

  await ensureOk(response);
  return parseSession(await response.json());
};

export const refreshAuthSession = async (refreshToken?: string): Promise<AuthSession> => {
  const response = await fetch(resolvePath("/auth/refresh"), {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(refreshToken ? { refresh: refreshToken } : {}),
    credentials: "include"
  });

  await ensureOk(response);
  return parseSession(await response.json());
};

export const getMe = async (accessToken: string): Promise<AuthUser> => {
  const response = await fetch(resolvePath("/auth/me"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    credentials: "include"
  });

  await ensureOk(response);
  const user = readUser(await response.json());

  if (!user) {
    throw new Error("Invalid user profile payload");
  }

  return user;
};

export const logout = async (accessToken: string, refreshToken?: string): Promise<void> => {
  const response = await fetch(resolvePath("/auth/logout"), {
    method: "POST",
    headers: {
      ...jsonHeaders,
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(refreshToken ? { refresh: refreshToken } : {}),
    credentials: "include"
  });

  await ensureOk(response);
};
