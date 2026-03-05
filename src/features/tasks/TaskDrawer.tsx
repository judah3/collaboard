import { Check, GripHorizontal, GripVertical, PencilLine, X } from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
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
  isLoading: boolean;
  users: Array<{ id: string; name: string }>;
  columns: BoardColumn[];
  availableTags: string[];
  draft: Partial<Task> | null;
  isSaving: boolean;
  errorMessage?: string | null;
  onStartEdit: (task: Task) => void;
  onDraftChange: (patch: Partial<Task>) => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onClose: () => void;
};

export const TaskDrawer = ({
  isOpen,
  task,
  isLoading,
  users,
  columns,
  availableTags,
  draft,
  isSaving,
  errorMessage,
  onStartEdit,
  onDraftChange,
  onCancelEdit,
  onSave,
  onClose
}: TaskDrawerProps) => {
  const hasDraft = Boolean(draft);
  const baselineRef = useRef<string>("");
  const paneContainerRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);
  const [detailsPaneHeight, setDetailsPaneHeight] = useState(320);
  const [isResizingPane, setIsResizingPane] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(420);
  const [isResizingDrawer, setIsResizingDrawer] = useState(false);
  const drawerResizeStartRef = useRef({ x: 0, width: 420 });

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

  useEffect(() => {
    if (!isResizingPane) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      const container = paneContainerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const minTopPane = 180;
      const minBottomPane = 160;
      const nextHeight = Math.min(Math.max(event.clientY - rect.top, minTopPane), rect.height - minBottomPane);
      setDetailsPaneHeight(nextHeight);
    };

    const onPointerUp = () => setIsResizingPane(false);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isResizingPane]);

  useEffect(() => {
    if (!isResizingDrawer) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      const minWidth = 360;
      const maxWidth = Math.max(minWidth, Math.min(760, window.innerWidth - 320));
      const delta = drawerResizeStartRef.current.x - event.clientX;
      const nextWidth = Math.min(Math.max(drawerResizeStartRef.current.width + delta, minWidth), maxWidth);
      setDrawerWidth(nextWidth);
    };

    const onPointerUp = () => setIsResizingDrawer(false);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isResizingDrawer]);

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (drawerRef.current?.contains(target)) {
        return;
      }

      if (target.closest("[data-task-drag-id]")) {
        return;
      }

      requestClose();
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [isOpen, hasUnsavedChanges]);

  if (!isOpen && !task && !isLoading) {
    return null;
  }

  const currentTask = mergedTask ?? task;

  return (
    <>
      <aside
        ref={drawerRef}
        className={cn(
          "fixed bottom-0 right-0 top-14 z-50 flex w-full flex-col border-l border-slate-200 bg-white p-4 shadow-xl transition-[transform,opacity] duration-300 ease-out will-change-transform sm:w-[420px] sm:p-6 lg:w-[var(--task-drawer-width)] lg:rounded-none",
          isOpen ? "task-drawer-slide-in translate-x-0 opacity-100" : "translate-x-full opacity-0 lg:hidden"
        )}
        style={{ "--task-drawer-width": `${drawerWidth}px` } as CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
      >
        <button
          type="button"
          onPointerDown={(event) => {
            event.preventDefault();
            drawerResizeStartRef.current = { x: event.clientX, width: drawerWidth };
            setIsResizingDrawer(true);
          }}
          className={cn(
            "absolute left-0 top-1/2 hidden h-24 w-3 -translate-x-1/2 -translate-y-1/2 cursor-col-resize items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:text-slate-600 lg:flex",
            isResizingDrawer ? "text-slate-700" : ""
          )}
          aria-label="Resize task drawer width"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Task Detail</h2>
          <div className="flex items-center gap-2">
            {!isLoading && task && hasDraft ? (
              <>
                <Button variant="primary" onClick={onSave} disabled={isSaving}>
                  <Check className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="secondary" onClick={onCancelEdit} disabled={isSaving}>
                  Cancel
                </Button>
              </>
            ) : !isLoading && task ? (
              <Button variant="secondary" onClick={() => onStartEdit(task)}>
                <PencilLine className="h-4 w-4" />
                Edit
              </Button>
            ) : null}

            <IconButton onClick={requestClose} aria-label="Close task detail drawer">
              <X className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        {isLoading || !currentTask ? (
          <div className="flex min-h-0 flex-1 items-center justify-center pb-6">
            <p className="text-sm text-slate-500">Loading task details...</p>
          </div>
        ) : (
          <div ref={paneContainerRef} className="flex min-h-0 flex-1 flex-col overflow-hidden pb-6">
            {errorMessage ? <p className="mb-2 text-sm text-red-600">{errorMessage}</p> : null}
            <div className="min-h-0 overflow-y-auto pr-1" style={{ height: detailsPaneHeight }}>
              <TaskDetails
                draft={currentTask}
                usersById={usersById}
                columns={columns}
                availableTags={availableTags}
                isEditing={hasDraft}
                onDraftChange={onDraftChange}
              />
            </div>

            <button
              type="button"
              onPointerDown={(event) => {
                event.preventDefault();
                setIsResizingPane(true);
              }}
              className={cn(
                "my-2 flex h-3 cursor-row-resize items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-500",
                isResizingPane ? "bg-slate-100 text-slate-500" : ""
              )}
              aria-label="Resize task details panel"
            >
              <GripHorizontal className="h-3.5 w-3.5" />
            </button>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <TaskComments task={currentTask} usersById={usersById} />
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
