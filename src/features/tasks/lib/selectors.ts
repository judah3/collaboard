import type { BoardColumn } from "@/features/board/types";
import type { Task } from "@/features/tasks/types";

export type TaskUIFilters = {
  searchQuery: string;
  assigneeFilter: string;
  tagFilter: string;
};

export const applyTaskFilters = (tasks: Task[], filters: TaskUIFilters) => {
  const query = filters.searchQuery.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesAssignee = filters.assigneeFilter === "all" || task.assigneeId === filters.assigneeFilter;
    const matchesTag = filters.tagFilter === "all" || task.tags.includes(filters.tagFilter);
    const matchesQuery =
      query.length === 0 ||
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query);

    return matchesAssignee && matchesTag && matchesQuery;
  });
};

export const groupTasksByColumn = (tasks: Task[], columns: BoardColumn[]) => {
  const grouped = columns.reduce<Record<string, Task[]>>((acc, column) => {
    acc[column.id] = [];
    return acc;
  }, {});

  for (const task of tasks) {
    if (!grouped[task.columnId]) {
      grouped[task.columnId] = [];
    }

    grouped[task.columnId].push(task);
  }

  for (const key of Object.keys(grouped)) {
    grouped[key] = grouped[key].sort((a, b) => a.order - b.order);
  }

  return grouped;
};