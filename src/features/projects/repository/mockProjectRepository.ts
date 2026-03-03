import { mockProject } from "@/features/projects/mockProject";
import type { ProjectRepository } from "@/features/projects/repository/types";
import { normalizeRequest, shapeResponse } from "@/shared/lib/interceptors";

const projects = [mockProject];

export const mockProjectRepository: ProjectRepository = {
  listProjects: async () => {
    normalizeRequest({ payload: { action: "list_projects" } });
    return shapeResponse(projects);
  },
  getProjectById: async (projectId) => {
    normalizeRequest({ payload: { action: "get_project", projectId } });
    return shapeResponse(projects.find((project) => project.id === projectId) ?? null);
  }
};