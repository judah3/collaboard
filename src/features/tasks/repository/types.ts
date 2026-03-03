import type { Task } from "@/features/tasks/types";

export type TaskQueryFilters = {
  assigneeId?: string;
  tag?: string;
  search?: string;
};

export type CreateTaskInput = {
  columnId: string;
  title: string;
  description?: string;
  assigneeId: string;
  dueDate: string;
  priority?: Task["priority"];
  tags?: string[];
};

export type ReorderTasksPayload = {
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  fromIndex: number;
  toIndex: number;
};

export type TaskRepository = {
  getTasksByProjectId: (projectId: string) => Promise<Task[]>;
  createTask: (projectId: string, input: CreateTaskInput) => Promise<Task>;
  updateTask: (projectId: string, taskId: string, patch: Partial<Task>) => Promise<Task>;
  reorderTasks: (projectId: string, payload: ReorderTasksPayload) => Promise<Task[]>;
};