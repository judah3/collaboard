import { useEffect, useMemo, useRef } from "react";
import { Check, PencilLine, X } from "lucide-react";
import type { BoardColumn } from "@/features/board/types";
import { TaskComments } from "@/features/tasks/TaskComments";
import { TaskDetails } from "@/features/tasks/TaskDetails";
import type { Task } from "@/features/tasks/types";
import { Button } from "@/shared/ui/Button";
import { IconButton } from "@/shared/ui/IconButton";
import { cn } from "@/shared/lib/cn";

type TaskDrawerProps = {
  isOpen: boolean;
  task: Task | null;
  users: Array<{ id: string; name: string }>;
  columns: BoardColumn[];
  draft: Partial<Task> | null;
  isSaving: boolean;
  onStartEdit: (task: Task) => void;
  onDraftChange: (patch: Partial<Task>) => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onClose: () => void;
};

export const TaskDrawer = ({
  isOpen,
  task,
  users,
  columns,
  draft,
  isSaving,
  onStartEdit,
  onDraftChange,
  onCancelEdit,
  onSave,
  onClose
}: TaskDrawerProps) => {
  const hasDraft = Boolean(draft);
  const baselineRef = useRef<string>("");

  const usersById = useMemo(
    () =>
      users.reduce<Record<string, string>>((acc, user) => {
        acc[user.id] = user.name;
        return acc;
      }, {}),
    [users]
  );

  useEffect(() => {
    if (task) {
      baselineRef.current = JSON.stringify(task);
    }
  }, [task?.id]);

  const mergedTask = task ? ({ ...task, ...(draft ?? {}) } as Task) : null;
  const hasUnsavedChanges = Boolean(hasDraft && mergedTask && JSON.stringify(mergedTask) !== baselineRef.current);

  const requestClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("You have unsaved changes. Discard them?");
      if (!confirmed) {
        return;
      }
      onCancelEdit();
    }

    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        requestClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, hasUnsavedChanges]);

  if (!task) {
    return null;
  }

  const currentTask = mergedTask ?? task;

  return (
    <>
      <button
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/30 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={requestClose}
        aria-label="Close task drawer backdrop"
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full border-l border-slate-200 bg-white p-4 transition-transform duration-200 ease-out sm:w-[420px] sm:p-6 lg:static lg:z-auto lg:w-[420px] lg:rounded-2xl",
          isOpen ? "translate-x-0" : "translate-x-full lg:hidden"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Task Detail</h2>
          <div className="flex items-center gap-2">
            {hasDraft ? (
              <>
                <Button variant="primary" onClick={onSave} disabled={isSaving}>
                  <Check className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="secondary" onClick={onCancelEdit} disabled={isSaving}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => onStartEdit(task)}>
                <PencilLine className="h-4 w-4" />
                Edit
              </Button>
            )}

            <IconButton onClick={requestClose} aria-label="Close task detail drawer">
              <X className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        <div className="flex h-full flex-col gap-6 overflow-y-auto pb-6">
          <TaskDetails draft={currentTask} usersById={usersById} columns={columns} isEditing={hasDraft} onDraftChange={onDraftChange} />
          <TaskComments task={currentTask} usersById={usersById} />
        </div>
      </aside>
    </>
  );
};
