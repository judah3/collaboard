import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { MoreHorizontal, Plus } from "lucide-react";
import type { BoardColumn } from "@/features/board/types";
import type { Task } from "@/features/tasks/types";
import { CreateTaskInline } from "@/features/board/components/CreateTaskInline";
import { cn } from "@/shared/lib/cn";
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
  isTaskDragActive: boolean;
  isTaskDragOver: boolean;
  renderSortableTask: (task: Task) => ReactNode;
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
  isTaskDragActive,
  isTaskDragOver,
  renderSortableTask
}: ColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: `column-drop-${column.id}`,
    data: { type: "column-drop", columnId: column.id }
  });

  return (
    <section
      className={cn(
        "no-scrollbar group w-full overflow-hidden rounded-xl bg-slate-50 p-3 transition-colors duration-200",
        isTaskDragOver ? "bg-blue-50/70" : "bg-slate-50"
      )}
      data-column-id={column.id}
    >
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

      <div
        ref={setNodeRef}
        data-column-drop-id={column.id}
        className={cn(
          "mt-3 min-h-10 overflow-hidden rounded-lg border border-dashed px-3 py-1.5 text-xs transition-colors duration-200 ease-out",
          isTaskDragActive
            ? isTaskDragOver
              ? "opacity-100"
              : "opacity-70"
            : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-60",
          isTaskDragOver ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-300 text-slate-500"
        )}
      >
        {isTaskDragOver ? "Release to drop task" : "Drop task here"}
      </div>
    </section>
  );
};
