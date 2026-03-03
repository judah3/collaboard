export type ProjectMember = {
  id: string;
  name: string;
  role: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  progress: number;
  members: ProjectMember[];
};