import { API_BASE_URL } from "@/shared/config/env";

type JsonRecord = Record<string, unknown>;

export type WorkspaceItem = {
  id: string;
  name: string;
  slug: string;
};

export type ProjectItem = {
  id: string;
  name: string;
  workspaceId: string;
};

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
    try {
      const body = (await response.json()) as JsonRecord;
      const detail = readString(body, ["detail", "message", "error"]);
      throw new Error(detail ?? fallback);
    } catch {
      throw new Error(fallback);
    }
  }
};

const authHeaders = (accessToken: string) => ({
  ...jsonHeaders,
  Authorization: `Bearer ${accessToken}`
});

const mapWorkspace = (payload: unknown): WorkspaceItem | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const id = readString(payload, ["id", "workspace_id"]);
  const name = readString(payload, ["name"]);
  const slug = readString(payload, ["slug"]);

  if (!id || !name || !slug) {
    return null;
  }

  return { id, name, slug };
};

const mapProject = (payload: unknown, workspaceId: string): ProjectItem | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const id = readString(payload, ["id", "project_id"]);
  const name = readString(payload, ["name"]);

  if (!id || !name) {
    return null;
  }

  return { id, name, workspaceId };
};

export const listWorkspaces = async (accessToken: string): Promise<WorkspaceItem[]> => {
  const response = await fetch(resolvePath("/workspaces"), {
    method: "GET",
    headers: authHeaders(accessToken),
    credentials: "include"
  });

  await ensureOk(response);
  const payload = await response.json();
  return readArray(payload).map(mapWorkspace).filter((item): item is WorkspaceItem => item !== null);
};

export const createWorkspace = async (
  accessToken: string,
  input: { name: string; slug: string }
): Promise<WorkspaceItem> => {
  const response = await fetch(resolvePath("/workspaces"), {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
    credentials: "include"
  });

  await ensureOk(response);
  const workspace = mapWorkspace(await response.json());
  if (!workspace) {
    throw new Error("Unexpected workspace response from server");
  }
  return workspace;
};

export const listProjectsByWorkspace = async (accessToken: string, workspaceId: string): Promise<ProjectItem[]> => {
  const response = await fetch(resolvePath(`/workspaces/${workspaceId}/projects`), {
    method: "GET",
    headers: authHeaders(accessToken),
    credentials: "include"
  });

  await ensureOk(response);
  const payload = await response.json();
  return readArray(payload).map((item) => mapProject(item, workspaceId)).filter((item): item is ProjectItem => item !== null);
};

export const createProject = async (
  accessToken: string,
  workspaceId: string,
  input: { name: string; description: string; due_date: string; progress: number; archived: boolean }
): Promise<ProjectItem> => {
  const response = await fetch(resolvePath(`/workspaces/${workspaceId}/projects`), {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
    credentials: "include"
  });

  await ensureOk(response);
  const project = mapProject(await response.json(), workspaceId);
  if (!project) {
    throw new Error("Unexpected project response from server");
  }
  return project;
};
