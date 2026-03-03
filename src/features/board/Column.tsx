import { MoreHorizontal, Plus } from "lucide-react";
import { TaskCard } from "@/features/board/TaskCard";
import type { Task, TaskStatus } from "@/features/tasks/types";
import { Button } from "@/shared/ui/Button";
import { IconButton } from "@/shared/ui/IconButton";

type ColumnProps = {
  status: TaskStatus;
  tasks: Task[];
  assigneesById: Record<string, string>;
  onTaskClick: (taskId: string) => void;
};

export const Column = ({ status, tasks, assigneesById, onTaskClick }: ColumnProps) => {
  return (
    <section className="min-w-[320px] rounded-xl bg-slate-50 p-3">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{status}</h2>
          <p className="pt-1 text-sm text-slate-500">{tasks.length} Tasks</p>
        </div>
        <IconButton aria-label={`${status} options`}>
          <MoreHorizontal className="h-4 w-4" />
        </IconButton>
      </div>

      <Button className="mb-3 w-full justify-start gap-2" variant="secondary">
        <Plus className="h-4 w-4" />
        Add Task
      </Button>

      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} assigneeName={assigneesById[task.assigneeId]} onClick={() => onTaskClick(task.id)} />
        ))}
      </div>
    </section>
  );
};
