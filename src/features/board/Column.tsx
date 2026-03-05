import { useState, type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { MoreHorizontal } from "lucide-react";
import type { BoardColumn } from "@/features/board/types";
import type { Task } from "@/features/tasks/types";
import { CreateTaskInline } from "@/features/board/components/CreateTaskInline";
import { cn } from "@/shared/lib/cn";
import { IconButton } from "@/shared/ui/IconButton";

type ColumnProps = {
  column: BoardColumn;
  tasks: Task[];
  isCreateTaskOpen: boolean;
  isCreatingTask: boolean;
  taskCreateError: string | null;
  onCreateTaskCancel: () => void;
  onCreateTaskSubmit: (title: string) => void;
  onOpenCreateTask: () => void;
  onRenameColumn: () => void;
  onDeleteColumn: () => void;
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
  onCreateTaskCancel,
  onCreateTaskSubmit,
  onOpenCreateTask,
  onRenameColumn,
  onDeleteColumn,
  isTaskDragActive,
  isTaskDragOver,
  renderSortableTask
}: ColumnProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        <div className="relative">
          <IconButton
            aria-label={`${column.name} options`}
            onClick={(event) => {
              event.stopPropagation();
              setIsMenuOpen((open) => !open);
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </IconButton>

          {isMenuOpen ? (
            <div className="absolute right-0 top-11 z-20 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-md">
              <button
                className="flex w-full items-center rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsMenuOpen(false);
                  onOpenCreateTask();
                }}
              >
                Add Task
              </button>
              <button
                className="flex w-full items-center rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsMenuOpen(false);
                  onRenameColumn();
                }}
              >
                Rename Column
              </button>
              <button
                className="flex w-full items-center rounded-md px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsMenuOpen(false);
                  onDeleteColumn();
                }}
              >
                Delete Column
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {isCreateTaskOpen ? (
        <CreateTaskInline
          isSubmitting={isCreatingTask}
          errorMessage={taskCreateError}
          onCreate={onCreateTaskSubmit}
          onCancel={onCreateTaskCancel}
        />
      ) : null}

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
