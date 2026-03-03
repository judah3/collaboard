import { MessageSquare, Paperclip } from "lucide-react";
import type { Task } from "@/features/tasks/types";
import { cn } from "@/shared/lib/cn";
import { formatDueDate } from "@/shared/lib/date";
import { Avatar } from "@/shared/ui/Avatar";
import { Badge } from "@/shared/ui/Badge";

type TaskCardProps = {
  task: Task;
  assigneeName?: string;
  onClick: () => void;
};

const priorityTone: Record<Task["priority"], "red" | "amber" | "slate"> = {
  High: "red",
  Medium: "amber",
  Low: "slate"
};

export const TaskCard = ({ task, assigneeName, onClick }: TaskCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-150 hover:border-slate-300 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/40"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{task.title}</h3>
        <Badge label={task.priority} tone={priorityTone[task.priority]} />
      </div>

      <p className="line-clamp-2 pt-2 text-sm text-slate-600">{task.description}</p>

      <div className="flex flex-wrap gap-2 pt-3">
        {task.tags.map((tag) => (
          <Badge key={tag} label={`#${tag}`} tone="blue" className="font-normal" />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          {assigneeName ? <Avatar name={assigneeName} size="sm" /> : null}
          <span>{formatDueDate(task.dueDate)}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <MessageSquare className={cn("h-3.5 w-3.5")} />
            {task.commentsCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Paperclip className="h-3.5 w-3.5" />
            {task.attachmentsCount}
          </span>
        </div>
      </div>
    </button>
  );
};
