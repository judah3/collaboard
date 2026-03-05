export type BoardColumnColor = string;

export type BoardColumn = {
  id: string;
  projectId: string;
  name: string;
  order: number;
  color?: BoardColumnColor;
  createdAt: string;
};
