import type { ReactNode } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import type { BoardColumn } from "@/features/board/types";
import type { Task } from "@/features/tasks/types";
import { CreateTaskInline } from "@/features/board/components/CreateTaskInline";
import { Button } from "@/shared/ui/Button";
import { IconButton } from "@/shared/ui/IconButton";

type ColumnProps = {
  column: BoardColumn;
  tasks: Task[];
  isCreateTaskOpen: boolean;
  isCreatingTask: boolean;
  taskCreateError: string | null;
  onCreateTaskOpen: () => void;
  onCreateTaskCancel: () => void;
  onCreateTaskSubmit: (title: string) => void;
  renderSortableTask: (task: Task) => ReactNode;
  dropZone: ReactNode;
};

export const Column = ({
  column,
  tasks,
  isCreateTaskOpen,
  isCreatingTask,
  taskCreateError,
  onCreateTaskOpen,
  onCreateTaskCancel,
  onCreateTaskSubmit,
  renderSortableTask,
  dropZone
}: ColumnProps) => {
  return (
    <section className="min-w-[320px] rounded-xl bg-slate-50 p-3" data-column-id={column.id}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{column.name}</h2>
          <p className="pt-1 text-sm text-slate-500">{tasks.length} Tasks</p>
        </div>
        <IconButton aria-label={`${column.name} options`}>
          <MoreHorizontal className="h-4 w-4" />
        </IconButton>
      </div>

      {isCreateTaskOpen ? (
        <CreateTaskInline
          isSubmitting={isCreatingTask}
          errorMessage={taskCreateError}
          onCreate={onCreateTaskSubmit}
          onCancel={onCreateTaskCancel}
        />
      ) : (
        <Button className="mb-3 w-full justify-start gap-2" variant="secondary" onClick={onCreateTaskOpen}>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      )}

      <div className="flex flex-col gap-3">
        {tasks.map((task) => renderSortableTask(task))}
      </div>

      {tasks.length === 0 ? <div className="pt-3">{dropZone}</div> : null}
    </section>
  );
};
