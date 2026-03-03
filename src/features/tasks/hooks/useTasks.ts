import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/app/repositories";
import { applyTaskFilters, type TaskUIFilters } from "@/features/tasks/lib/selectors";
import type { CreateTaskInput, ReorderTasksPayload } from "@/features/tasks/repository/types";
import type { Task } from "@/features/tasks/types";

export const useTasks = (projectId: string, filters: TaskUIFilters) => {
  const { taskRepository } = useRepositories();

  return useQuery({
    queryKey: ["tasks", projectId, filters],
    queryFn: async () => {
      const tasks = await taskRepository.getTasksByProjectId(projectId);
      return applyTaskFilters(tasks, filters);
    }
  });
};

export const useCreateTask = (projectId: string) => {
  const { taskRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => taskRepository.createTask(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    }
  });
};

export const useUpdateTask = (projectId: string) => {
  const { taskRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, patch }: { taskId: string; patch: Partial<Task> }) =>
      taskRepository.updateTask(projectId, taskId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    }
  });
};

export const useReorderTasks = (projectId: string) => {
  const { taskRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderTasksPayload) => taskRepository.reorderTasks(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    }
  });
};