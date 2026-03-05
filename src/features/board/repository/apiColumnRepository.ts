import { getStoredAuthSession } from "@/features/auth/storage";
import type { ColumnRepository, CreateColumnInput, UpdateColumnInput } from "@/features/board/repository.types";
import type { BoardColumn } from "@/features/board/types";
import { API_BASE_URL } from "@/shared/config/env";

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

const readNumber = (record: JsonRecord, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
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

const ensureAuthToken = (): string => {
  const token = getStoredAuthSession()?.accessToken;
  if (!token) {
    throw new Error("Missing auth access token");
  }
  return token;
};

const ensureOk = async (response: Response) => {
  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`;
    let detail: string | undefined;
    try {
      const body = (await response.json()) as JsonRecord;
      detail = readString(body, ["detail", "message", "error"]);
    } catch {
      // Ignore JSON parse failure, fallback below.
    }
    throw new Error(detail ? `${detail} (status ${response.status})` : fallback);
  }
};

const mapColumn = (payload: unknown, projectId: string): BoardColumn | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const id = readString(payload, ["id", "column_id"]);
  const name = readString(payload, ["name"]);
  if (!id || !name) {
    return null;
  }

  return {
    id,
    projectId: readString(payload, ["project", "project_id"]) ?? projectId,
    name,
    order: readNumber(payload, ["order"]) ?? 0,
    color: readString(payload, ["color"]) ?? "slate",
    createdAt: readString(payload, ["created_at", "createdAt"]) ?? new Date().toISOString()
  };
};

export const apiColumnRepository: ColumnRepository = {
  getColumnsByProjectId: async (projectId) => {
    const token = ensureAuthToken();
    const response = await fetch(resolvePath(`/projects/${projectId}/columns`), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });

    await ensureOk(response);
    const payload = await response.json();
    return readArray(payload)
      .map((item) => mapColumn(item, projectId))
      .filter((item): item is BoardColumn => item !== null)
      .sort((a, b) => a.order - b.order);
  },

  createColumn: async (projectId, input: CreateColumnInput) => {
    const token = ensureAuthToken();
    const response = await fetch(resolvePath(`/projects/${projectId}/columns`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: input.name,
        color: input.color ?? "#64748b"
      }),
      credentials: "include"
    });

    await ensureOk(response);
    const column = mapColumn(await response.json(), projectId);
    if (!column) {
      throw new Error("Unexpected column response from server");
    }
    return column;
  },

  updateColumn: async (projectId, columnId, input: UpdateColumnInput) => {
    const token = ensureAuthToken();
    const response = await fetch(resolvePath(`/projects/${projectId}/columns/${columnId}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: input.name }),
      credentials: "include"
    });

    await ensureOk(response);
    const column = mapColumn(await response.json(), projectId);
    if (!column) {
      throw new Error("Unexpected column response from server");
    }
    return column;
  },

  deleteColumn: async (projectId, columnId) => {
    const token = ensureAuthToken();
    const response = await fetch(resolvePath(`/projects/${projectId}/columns/${columnId}`), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });

    await ensureOk(response);
  },

  reorderColumns: async (projectId, orderedColumnIds) => {
    const token = ensureAuthToken();
    const response = await fetch(resolvePath(`/projects/${projectId}/columns/reorder`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ordered_column_ids: orderedColumnIds }),
      credentials: "include"
    });

    await ensureOk(response);
    return [];
  }
};
