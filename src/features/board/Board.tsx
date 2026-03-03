import { Column } from "@/features/board/Column";
import type { Task, TaskStatus } from "@/features/tasks/types";

type BoardProps = {
  tasksByStatus: Record<TaskStatus, Task[]>;
  assigneesById: Record<string, string>;
  onTaskClick: (taskId: string) => void;
};

const statuses: TaskStatus[] = ["Backlog", "In Progress", "Completed"];

export const Board = ({ tasksByStatus, assigneesById, onTaskClick }: BoardProps) => {
  return (
    <div className="flex min-w-0 gap-4 overflow-x-auto pb-2">
      {statuses.map((status) => (
        <Column key={status} status={status} tasks={tasksByStatus[status]} assigneesById={assigneesById} onTaskClick={onTaskClick} />
      ))}
    </div>
  );
};
