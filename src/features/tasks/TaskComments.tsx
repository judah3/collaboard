import type { Task } from "@/features/tasks/types";
import { formatDueDate } from "@/shared/lib/date";
import { Avatar } from "@/shared/ui/Avatar";

type TaskCommentsProps = {
  task: Task;
  usersById: Record<string, string>;
};

export const TaskComments = ({ task, usersById }: TaskCommentsProps) => {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold text-slate-900">Comments</h3>
      <div className="space-y-3">
        {task.comments.map((comment) => {
          const authorName = usersById[comment.authorId];
          return (
            <div key={comment.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                {authorName ? <Avatar name={authorName} size="sm" /> : null}
                <p className="text-sm font-medium text-slate-700">{authorName}</p>
                <p className="text-xs text-slate-500">{formatDueDate(comment.createdAt)}</p>
              </div>
              <p className="text-sm text-slate-600">{comment.message}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
