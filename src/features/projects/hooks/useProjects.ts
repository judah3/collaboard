import { useQuery } from "@tanstack/react-query";
import { useRepositories } from "@/app/repositories";

export const useProjects = () => {
  const { projectRepository } = useRepositories();

  return useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => projectRepository.listProjects()
  });
};
