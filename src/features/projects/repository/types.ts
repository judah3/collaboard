import type { Project } from "@/features/projects/types";

export type ProjectRepository = {
  listProjects: () => Promise<Project[]>;
  getProjectById: (projectId: string) => Promise<Project | null>;
};