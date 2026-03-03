import type { Task } from "@/features/tasks/types";

export type TaskQueryFilters = {
  assigneeId?: string;
  tag?: string;
  search?: string;
};

export type TaskRepository = {
  getTasksByProjectId: (projectId: string) => Promise<Task[]>;
  updateTask: (projectId: string, taskId: string, patch: Partial<Task>) => Promise<Task>;
};