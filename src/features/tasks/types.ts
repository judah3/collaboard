export type TaskPriority = "High" | "Medium" | "Low";

export type User = {
  id: string;
  name: string;
};

export type TaskComment = {
  id: string;
  authorId: string;
  message: string;
  createdAt: string;
};

export type Task = {
  id: string;
  projectId: string;
  columnId: string;
  order: number;
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string;
  tags: string[];
  commentsCount: number;
  attachmentsCount: number;
  comments: TaskComment[];
};