import { API_BASE_URL } from "@/shared/config/env";
import type { ProjectMember } from "@/features/projects/types";

type JsonRecord = Record<string, unknown>;

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

const readArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (isRecord(payload) && Array.isArray(payload.results)) {
    return payload.results;
  }

  return [];
};

const ensureOk = async (response: Response) => {
  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`;
    let detail: string | undefined;
    try {
      const body = (await response.json()) as JsonRecord;
      detail = readString(body, ["detail", "message", "error"]);
    } catch {
      // Ignore JSON parse failures and fall back to generic status message.
    }

    throw new Error(detail ? `${detail} (status ${response.status})` : fallback);
  }
};

const mapMember = (payload: unknown, fallbackRole: string): ProjectMember => {
  if (!isRecord(payload)) {
    return {
      id: `member_${Date.now()}`,
      name: "New Member",
      role: fallbackRole,
      email: null,
      avatarUrl: null
    };
  }

  const memberRecord = isRecord(payload.member) ? payload.member : null;
  const rawUser = payload.user;
  const user = memberRecord ?? (isRecord(rawUser) ? rawUser : payload);
  const userId =
    (typeof rawUser === "string" && rawUser.trim() ? rawUser : undefined) ??
    readString(user, ["id", "user_id", "member_id", "user"]);
  const id = readString(payload, ["id", "member_id", "project_member_id"]) ?? userId ?? `member_${Date.now()}`;
  const email = readString(user, ["email"]) ?? null;
  const name = readString(user, ["name", "full_name", "email"]) ?? (userId ? `User ${userId.slice(0, 8)}` : "New Member");
  const avatarUrl = readString(user, ["avatar_url", "avatarUrl"]) ?? null;
  const role = readString(payload, ["role"]) ?? readString(user, ["role"]) ?? fallbackRole;

  return { id, userId: userId ?? id, name, email, avatarUrl, role };
};

export const addProjectMember = async (
  accessToken: string,
  projectId: string,
  input: { email: string; role: string }
): Promise<ProjectMember> => {
  const response = await fetch(resolvePath(`/projects/${projectId}/members`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(input),
    credentials: "include"
  });

  await ensureOk(response);
  return mapMember(await response.json(), input.role);
};

export const listProjectMembers = async (accessToken: string, projectId: string): Promise<ProjectMember[]> => {
  const response = await fetch(resolvePath(`/projects/${projectId}/members`), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    credentials: "include"
  });

  await ensureOk(response);
  const payload = await response.json();
  return readArray(payload).map((item) => mapMember(item, "MEMBER"));
};
