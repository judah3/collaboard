import type { Task } from "@/features/tasks/types";

export type TaskPatchInput = {
  title?: string;
  description?: string;
  priority?: Task["priority"];
  dueDate?: string;
  tags?: string[];
};

export const toTaskPatch = (input: TaskPatchInput): Partial<Task> => ({
  ...(input.title ? { title: input.title.trim() } : {}),
  ...(input.description ? { description: input.description.trim() } : {}),
  ...(input.priority ? { priority: input.priority } : {}),
  ...(input.dueDate ? { dueDate: input.dueDate } : {}),
  ...(input.tags ? { tags: input.tags } : {})
});