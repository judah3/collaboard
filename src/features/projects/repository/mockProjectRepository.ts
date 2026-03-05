import { getStoredAuthSession } from "@/features/auth/storage";
import { API_BASE_URL } from "@/shared/config/env";
import { mockProject } from "@/features/projects/mockProject";
import { listProjectsByWorkspace, listWorkspaces } from "@/features/workspaces/api";
import type { ProjectRepository } from "@/features/projects/repository/types";
import type { Project, ProjectMember } from "@/features/projects/types";

type JsonRecord = Record<string, unknown>;

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

const ensureAuthToken = (): string => {
  const token = getStoredAuthSession()?.accessToken;
  if (!token) {
    throw new Error("Missing auth access token");
  }
  return token;
};

const resolvePath = (path: string) => `${API_BASE_URL}${path}`;

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

const toFallbackMember = (): ProjectMember => ({
  id: "member-unassigned",
  name: "Unassigned",
  role: "Member"
});

const mapMember = (payload: unknown): ProjectMember | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const user = isRecord(payload.user) ? payload.user : payload;
  const id = readString(user, ["id", "user_id", "member_id"]);
  const name = readString(user, ["name", "full_name", "email"]);
  const role = readString(payload, ["role"]) ?? readString(user, ["role"]) ?? "Member";

  if (!id || !name) {
    return null;
  }

  return { id, name, role };
};

const mapProject = (payload: unknown): Project | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const id = readString(payload, ["id", "project_id"]);
  const name = readString(payload, ["name"]);

  if (!id || !name) {
    return null;
  }

  const description = readString(payload, ["description"]) ?? "";
  const dueDate = readString(payload, ["due_date", "dueDate"]) ?? "2026-12-31";
  const progress = Math.max(0, Math.min(100, readNumber(payload, ["progress"]) ?? 0));

  const membersRaw = Array.isArray(payload.members) ? payload.members : [];
  const members = membersRaw.map(mapMember).filter((member): member is ProjectMember => member !== null);

  return {
    id,
    name,
    description,
    dueDate,
    progress,
    members: members.length > 0 ? members : [toFallbackMember()]
  };
};

const toProjectFromWorkspaceList = (payload: { id: string; name: string }): Project => ({
  id: payload.id,
  name: payload.name,
  description: "",
  dueDate: "2026-12-31",
  progress: 0,
  members: [toFallbackMember()]
});

export const mockProjectRepository: ProjectRepository = {
  listProjects: async () => {
    const seedProjects: Project[] = [mockProject];

    try {
      const accessToken = ensureAuthToken();
      const workspaces = await listWorkspaces(accessToken);

      const groupedProjects = await Promise.all(
        workspaces.map(async (workspace) => listProjectsByWorkspace(accessToken, workspace.id))
      );

      const apiProjects = groupedProjects.flat().map(toProjectFromWorkspaceList);
      const unique = new Map<string, Project>(seedProjects.map((project) => [project.id, project]));
      for (const project of apiProjects) {
        if (!unique.has(project.id)) {
          unique.set(project.id, project);
        }
      }

      return Array.from(unique.values());
    } catch {
      return seedProjects;
    }
  },

  getProjectById: async (projectId) => {
    if (projectId === mockProject.id) {
      return mockProject;
    }

    const accessToken = ensureAuthToken();
    const response = await fetch(resolvePath(`/projects/${projectId}`), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      credentials: "include"
    });

    await ensureOk(response);
    return mapProject(await response.json());
  }
};
