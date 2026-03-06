import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@/app/repositories";
import { applyTaskFilters, type TaskUIFilters } from "@/features/tasks/lib/selectors";
import type { CreateTaskInput, ReorderTasksPayload } from "@/features/tasks/repository/types";
import type { Task } from "@/features/tasks/types";

const reorderTasksLocally = (tasks: Task[], payload: ReorderTasksPayload): Task[] => {
  const draft = tasks.map((task) => ({ ...task }));
  const taskIndex = draft.findIndex((task) => task.id === payload.taskId);
  if (taskIndex < 0) {
    return tasks;
  }

  const columns = draft.reduce<Record<string, Task[]>>((acc, task) => {
    if (!acc[task.columnId]) {
      acc[task.columnId] = [];
    }
    acc[task.columnId].push(task);
    return acc;
  }, {});

  for (const columnId of Object.keys(columns)) {
    columns[columnId].sort((a, b) => a.order - b.order);
  }

  const movedTask = draft[taskIndex];
  const sourceColumnId = movedTask.columnId;
  const sourceTasks = [...(columns[sourceColumnId] ?? [])];
  const sourceIndex = sourceTasks.findIndex((task) => task.id === movedTask.id);
  if (sourceIndex < 0) {
    return tasks;
  }

  sourceTasks.splice(sourceIndex, 1);
  columns[sourceColumnId] = sourceTasks.map((task, index) => ({ ...task, columnId: sourceColumnId, order: index }));

  const targetTasks = [...(columns[payload.toColumnId] ?? [])];
  const targetIndex = Math.max(0, Math.min(payload.toIndex, targetTasks.length));
  targetTasks.splice(targetIndex, 0, { ...movedTask, columnId: payload.toColumnId });
  columns[payload.toColumnId] = targetTasks.map((task, index) => ({ ...task, columnId: payload.toColumnId, order: index }));

  return Object.values(columns)
    .flat()
    .sort((a, b) => {
      if (a.columnId === b.columnId) {
        return a.order - b.order;
      }
      return a.columnId.localeCompare(b.columnId);
    });
};

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
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", projectId] });
      const previousQueries = queryClient.getQueriesData<Task[]>({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0] === "tasks" && query.queryKey[1] === projectId
      });

      queryClient.setQueriesData<Task[]>(
        {
          predicate: (query) =>
            Array.isArray(query.queryKey) && query.queryKey[0] === "tasks" && query.queryKey[1] === projectId
        },
        (current) => {
          if (!current) {
            return current;
          }
          return reorderTasksLocally(current, payload);
        }
      );

      return { previousQueries };
    },
    onError: (_error, _payload, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    }
  });
};
