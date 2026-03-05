import type { BoardColumn } from "@/features/board/types";

export type CreateColumnInput = {
  name: string;
  color?: BoardColumn["color"];
};

export type UpdateColumnInput = {
  name: string;
};

export type ColumnRepository = {
  getColumnsByProjectId: (projectId: string) => Promise<BoardColumn[]>;
  createColumn: (projectId: string, input: CreateColumnInput) => Promise<BoardColumn>;
  updateColumn: (projectId: string, columnId: string, input: UpdateColumnInput) => Promise<BoardColumn>;
  deleteColumn: (projectId: string, columnId: string) => Promise<void>;
  reorderColumns: (projectId: string, orderedColumnIds: string[]) => Promise<BoardColumn[]>;
};
