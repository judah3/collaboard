import type { Task, TaskStatus } from "@/features/tasks/types";

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

export const groupTasksByStatus = (tasks: Task[]) => {
  const statuses: TaskStatus[] = ["Backlog", "In Progress", "Completed"];

  return statuses.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status);
      return acc;
    },
    {
      Backlog: [],
      "In Progress": [],
      Completed: []
    } as Record<TaskStatus, Task[]>
  );
};