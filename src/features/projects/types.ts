export type ProjectMember = {
  id: string;
  name: string;
  role: string;
  userId?: string;
  email?: string | null;
  avatarUrl?: string | null;
};

export type Project = {
  id: string;
  workspaceId?: string;
  name: string;
  description: string;
  dueDate: string;
  progress: number;
  members: ProjectMember[];
};
