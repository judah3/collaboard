import type { Task } from "@/features/tasks/types";

export type TaskPatchInput = {
  columnId?: string;
  title?: string;
  description?: string;
  priority?: Task["priority"];
  assigneeId?: string;
  dueDate?: string;
  tags?: string[];
};

export const toTaskPatch = (input: TaskPatchInput): Partial<Task> => ({
  ...(input.columnId ? { columnId: input.columnId } : {}),
  ...(typeof input.title === "string" ? { title: input.title.trim() } : {}),
  ...(typeof input.description === "string" ? { description: input.description.trim() } : {}),
  ...(input.priority ? { priority: input.priority } : {}),
  ...(input.assigneeId ? { assigneeId: input.assigneeId } : {}),
  ...(input.dueDate ? { dueDate: input.dueDate } : {}),
  ...(input.tags ? { tags: input.tags } : {})
});