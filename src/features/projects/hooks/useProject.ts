import { useQuery } from "@tanstack/react-query";
import { useRepositories } from "@/app/repositories";

export const useProject = (projectId: string) => {
  const { projectRepository } = useRepositories();

  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const project = await projectRepository.getProjectById(projectId);

      if (!project) {
        throw new Error("Project not found");
      }

      return project;
    }
  });
};