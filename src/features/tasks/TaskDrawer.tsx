import { useEffect } from "react";
import { X } from "lucide-react";
import type { Task } from "@/features/tasks/types";
import { TaskComments } from "@/features/tasks/TaskComments";
import { TaskDetails } from "@/features/tasks/TaskDetails";
import { IconButton } from "@/shared/ui/IconButton";
import { cn } from "@/shared/lib/cn";

type TaskDrawerProps = {
  isOpen: boolean;
  task: Task | null;
  users: Array<{ id: string; name: string }>;
  onClose: () => void;
};

export const TaskDrawer = ({ isOpen, task, users, onClose }: TaskDrawerProps) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!task) {
    return null;
  }

  const usersById = users.reduce<Record<string, string>>((acc, user) => {
    acc[user.id] = user.name;
    return acc;
  }, {});

  return (
    <>
      <button
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/30 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
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
          <IconButton onClick={onClose} aria-label="Close task detail drawer">
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="flex h-full flex-col gap-6 overflow-y-auto pb-6">
          <TaskDetails task={task} usersById={usersById} />
          <TaskComments task={task} usersById={usersById} />
        </div>
      </aside>
    </>
  );
};
