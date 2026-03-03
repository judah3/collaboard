import type { BoardColumn } from "@/features/board/types";

export type CreateColumnInput = {
  name: string;
  color?: BoardColumn["color"];
};

export type ColumnRepository = {
  getColumnsByProjectId: (projectId: string) => Promise<BoardColumn[]>;
  createColumn: (projectId: string, input: CreateColumnInput) => Promise<BoardColumn>;
  reorderColumns: (projectId: string, orderedColumnIds: string[]) => Promise<BoardColumn[]>;
};