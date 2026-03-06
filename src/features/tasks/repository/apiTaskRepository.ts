import { getStoredAuthSession } from "@/features/auth/storage";
import type { CreateTaskInput, ReorderTasksPayload, TaskRepository } from "@/features/tasks/repository/types";
import type { Task } from "@/features/tasks/types";
import { API_BASE_URL } from "@/shared/config/env";

type JsonRecord = Record<string, unknown>;
type ApiPriority = "LOW" | "MEDIUM" | "HIGH";
const isUuid = (value?: string) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

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

const readStringArray = (record: JsonRecord, keys: string[]): string[] => {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string");
    }
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

const toUiPriority = (priority?: string): Task["priority"] => {
  if (priority === "HIGH") return "High";
  if (priority === "LOW") return "Low";
  return "Medium";
};

const toApiPriority = (priority?: Task["priority"]): ApiPriority => {
  if (priority === "High") return "HIGH";
  if (priority === "Low") return "LOW";
  return "MEDIUM";
};

const mapTask = (payload: unknown, projectId: string): Task | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const id = readString(payload, ["id", "task_id"]);
  const title = readString(payload, ["title"]);
  const columnId = readString(payload, ["column", "column_id"]);

  if (!id || !title || !columnId) {
    return null;
  }

  const commentsRaw = Array.isArray(payload.comments) ? payload.comments : [];
  const directTags = readStringArray(payload, ["tags", "tag_names", "tagNames"]);
  const nestedTags = Array.isArray(payload.task_tags)
    ? payload.task_tags
        .map((tag) => (isRecord(tag) ? readString(tag, ["name", "label", "tag"]) : undefined))
        .filter((tag): tag is string => typeof tag === "string")
    : [];
  const tags = directTags.length > 0 ? directTags : nestedTags;

  return {
    id,
    projectId: readString(payload, ["project", "project_id"]) ?? projectId,
    columnId,
    order: readNumber(payload, ["order"]) ?? 0,
    title,
    description: readString(payload, ["description"]) ?? "",
    priority: toUiPriority(readString(payload, ["priority"])),
    assigneeId: readString(payload, ["assignee", "assignee_id"]) ?? "unassigned",
    dueDate: readString(payload, ["due_date", "dueDate"]) ?? new Date().toISOString().slice(0, 10),
    tags,
    commentsCount: readNumber(payload, ["comments_count", "commentsCount"]) ?? commentsRaw.length,
    attachmentsCount: readNumber(payload, ["attachments_count", "attachmentsCount"]) ?? 0,
    comments: commentsRaw
      .map((comment) => {
        if (!isRecord(comment)) return null;
        const commentId = readString(comment, ["id", "comment_id"]);
        const authorId = readString(comment, ["author", "author_id"]);
        const message = readString(comment, ["message"]);
        const createdAt = readString(comment, ["created_at", "createdAt"]);
        if (!commentId || !authorId || !message || !createdAt) return null;
        return { id: commentId, authorId, message, createdAt };
      })
      .filter((comment): comment is Task["comments"][number] => comment !== null)
  };
};

export const apiTaskRepository: TaskRepository = {
  getTasksByProjectId: async (projectId) => {
    const token = ensureAuthToken();
    const response = await fetch(resolvePath(`/projects/${projectId}/tasks`), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });

    await ensureOk(response);
    const payload = await response.json();
    return readArray(payload)
      .map((item) => mapTask(item, projectId))
      .filter((item): item is Task => item !== null)
      .sort((a, b) => {
        if (a.columnId === b.columnId) {
          return a.order - b.order;
        }
        return a.columnId.localeCompare(b.columnId);
      });
  },

  createTask: async (projectId, input: CreateTaskInput) => {
    const token = ensureAuthToken();
    const response = await fetch(resolvePath(`/projects/${projectId}/tasks`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        column: input.columnId,
        title: input.title,
        description: input.description ?? "",
        priority: toApiPriority(input.priority),
        assignee: isUuid(input.assigneeId) ? input.assigneeId : null,
        due_date: input.dueDate,
        tags: input.tags ?? []
      }),
      credentials: "include"
    });

    await ensureOk(response);
    const task = mapTask(await response.json(), projectId);
    if (!task) {
      throw new Error("Unexpected task response from server");
    }
    return task;
  },

  updateTask: async (projectId, taskId, patch) => {
    const token = ensureAuthToken();
    const body: JsonRecord = {};

    if (typeof patch.title === "string") body.title = patch.title;
    if (typeof patch.description === "string") body.description = patch.description;
    if (typeof patch.priority === "string") body.priority = toApiPriority(patch.priority);
    if (typeof patch.assigneeId === "string") body.assignee = isUuid(patch.assigneeId) ? patch.assigneeId : null;
    if (typeof patch.dueDate === "string") body.due_date = patch.dueDate;
    if (typeof patch.columnId === "string") body.column = patch.columnId;
    if (Array.isArray(patch.tags)) body.tags = patch.tags;

    let response: Response;
    try {
      response = await fetch(resolvePath(`/projects/${projectId}/tasks/${taskId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body),
        credentials: "include"
      });
    } catch {
      // Some deployments/proxies block PATCH preflight; fall back to PUT with the same payload.
      response = await fetch(resolvePath(`/projects/${projectId}/tasks/${taskId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body),
        credentials: "include"
      });
    }

    await ensureOk(response);
    const task = mapTask(await response.json(), projectId);
    if (!task) {
      throw new Error("Unexpected task response from server");
    }
    return task;
  },

  reorderTasks: async (projectId, payload: ReorderTasksPayload) => {
    const token = ensureAuthToken();
    const response = await fetch(resolvePath(`/projects/${projectId}/tasks/reorder`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        task_id: payload.taskId,
        from_column_id: payload.fromColumnId,
        to_column_id: payload.toColumnId,
        from_index: payload.fromIndex,
        to_index: payload.toIndex
      }),
      credentials: "include"
    });

    await ensureOk(response);
    return [];
  }
};
