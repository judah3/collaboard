import type { BoardColumn } from "@/features/board/types";

export const mockColumns: BoardColumn[] = [
  { id: "col-backlog", projectId: "mad-dogs-portal", name: "Backlog", order: 0, color: "slate", createdAt: "2026-03-01T00:00:00.000Z" },
  { id: "col-in-progress", projectId: "mad-dogs-portal", name: "In Progress", order: 1, color: "blue", createdAt: "2026-03-01T00:00:00.000Z" },
  { id: "col-completed", projectId: "mad-dogs-portal", name: "Completed", order: 2, color: "green", createdAt: "2026-03-01T00:00:00.000Z" }
];