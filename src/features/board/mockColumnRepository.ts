import { mockColumns } from "@/features/board/mockColumns";
import type { ColumnRepository, CreateColumnInput } from "@/features/board/repository.types";
import type { BoardColumn } from "@/features/board/types";
import { normalizeRequest, shapeResponse } from "@/shared/lib/interceptors";

let columns: BoardColumn[] = [...mockColumns];

const normalizeName = (name: string) => name.trim().toLowerCase();

const ensureColumnRules = (projectId: string, input: CreateColumnInput) => {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Column name is required");
  }

  if (name.length > 40) {
    throw new Error("Column name must be 40 characters or fewer");
  }

  const projectColumns = columns.filter((column) => column.projectId === projectId);

  if (projectColumns.length >= 8) {
    throw new Error("Maximum 8 columns");
  }

  const hasDuplicate = projectColumns.some((column) => normalizeName(column.name) === normalizeName(name));
  if (hasDuplicate) {
    throw new Error("Column name already exists");
  }

  return name;
};

const orderedProjectColumns = (projectId: string) =>
  columns
    .filter((column) => column.projectId === projectId)
    .sort((a, b) => a.order - b.order);

export const mockColumnRepository: ColumnRepository = {
  getColumnsByProjectId: async (projectId) => {
    normalizeRequest({ payload: { action: "get_columns", projectId } });
    return shapeResponse(orderedProjectColumns(projectId));
  },

  createColumn: async (projectId, input) => {
    normalizeRequest({ payload: { action: "create_column", projectId } });
    const name = ensureColumnRules(projectId, input);
    const projectColumns = orderedProjectColumns(projectId);

    const created: BoardColumn = {
      id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      name,
      order: projectColumns.length,
      color: input.color ?? "slate",
      createdAt: new Date().toISOString()
    };

    columns = [...columns, created];

    return shapeResponse(created);
  },

  reorderColumns: async (projectId, orderedColumnIds) => {
    normalizeRequest({ payload: { action: "reorder_columns", projectId } });
    const projectColumns = orderedProjectColumns(projectId);
    const idSet = new Set(projectColumns.map((column) => column.id));

    if (orderedColumnIds.length !== projectColumns.length || orderedColumnIds.some((id) => !idSet.has(id))) {
      throw new Error("Invalid column reorder payload");
    }

    const reOrdered = orderedColumnIds.map((id, index) => {
      const column = projectColumns.find((item) => item.id === id)!;
      return { ...column, order: index };
    });

    columns = [...columns.filter((column) => column.projectId !== projectId), ...reOrdered];

    return shapeResponse(reOrdered);
  }
};