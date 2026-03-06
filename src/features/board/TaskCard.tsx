import { Check, Copy, MessageSquare, Paperclip } from "lucide-react";
import { useMemo, useState, type MouseEvent } from "react";
import type { Task } from "@/features/tasks/types";
import { cn } from "@/shared/lib/cn";
import { formatDueDate } from "@/shared/lib/date";
import { slugify } from "@/shared/lib/slugify";
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
  const [isTitleSlugCopied, setIsTitleSlugCopied] = useState(false);
  const taskTitleSlug = useMemo(() => slugify(task.title), [task.title]);

  const handleCopyTaskTitleSlug = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const valueToCopy = taskTitleSlug;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(valueToCopy);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = valueToCopy;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setIsTitleSlugCopied(true);
      window.setTimeout(() => setIsTitleSlugCopied(false), 1200);
    } catch {
      setIsTitleSlugCopied(false);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="w-full transform-gpu cursor-pointer rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md active:translate-y-0 focus:outline-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <h3 className="truncate text-sm font-semibold text-slate-900">{task.title}</h3>
          <button
            type="button"
            onClick={(event) => void handleCopyTaskTitleSlug(event)}
            className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label={`Copy task slug ${taskTitleSlug}`}
            title={isTitleSlugCopied ? "Copied" : "Copy task slug"}
          >
            {isTitleSlugCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge label={task.priority} tone={priorityTone[task.priority]} />
        </div>
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
    </article>
  );
};


