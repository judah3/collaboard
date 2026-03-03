import type { BoardColumn } from "@/features/board/types";
import type { Task } from "@/features/tasks/types";

export const arrayMove = <T>(items: T[], fromIndex: number, toIndex: number): T[] => {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
};

export const reorderColumnsLocally = (columns: BoardColumn[], activeId: string, overId: string) => {
  const from = columns.findIndex((column) => column.id === activeId);
  const to = columns.findIndex((column) => column.id === overId);

  if (from < 0 || to < 0 || from === to) {
    return columns;
  }

  return arrayMove(columns, from, to).map((column, index) => ({ ...column, order: index }));
};

export const reorderTasksLocally = (tasks: Task[], movedTaskId: string, toColumnId: string, toIndex: number) => {
  const moved = tasks.find((task) => task.id === movedTaskId);
  if (!moved) {
    return tasks;
  }

  const sameColumnTasks = tasks
    .filter((task) => task.columnId === moved.columnId && task.id !== movedTaskId)
    .sort((a, b) => a.order - b.order)
    .map((task, index) => ({ ...task, order: index }));

  const targetColumnTasks = tasks
    .filter((task) => task.columnId === toColumnId && task.id !== movedTaskId)
    .sort((a, b) => a.order - b.order);

  const inserted = [...targetColumnTasks];
  inserted.splice(Math.max(0, Math.min(toIndex, inserted.length)), 0, { ...moved, columnId: toColumnId });

  const normalizedTarget = inserted.map((task, index) => ({ ...task, order: index }));
  const untouched = tasks.filter((task) => task.columnId !== moved.columnId && task.columnId !== toColumnId);

  return [...untouched, ...sameColumnTasks, ...normalizedTarget];
};