import type { Task } from "@/features/tasks/types";
import { mockUsers } from "@/features/tasks/mockTasks";
import { formatDueDate } from "@/shared/lib/date";
import { Avatar } from "@/shared/ui/Avatar";
import { Badge } from "@/shared/ui/Badge";
import { Divider } from "@/shared/ui/Divider";

export const TaskDetails = ({ task }: { task: Task }) => {
  const assignee = mockUsers.find((user) => user.id === task.assigneeId);
  const priorityTone = task.priority === "High" ? "red" : task.priority === "Medium" ? "amber" : "slate";

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">{task.title}</h2>
        <p className="text-sm text-slate-600">{task.description}</p>
      </div>

      <Divider />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Assignee</p>
          <div className="flex items-center gap-2 text-slate-700">{assignee ? <Avatar name={assignee.name} size="sm" /> : null}{assignee?.name}</div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Priority</p>
          <Badge label={task.priority} tone={priorityTone} />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Due Date</p>
          <p className="text-sm text-slate-700">{formatDueDate(task.dueDate)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Tags</p>
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag) => (
              <Badge key={tag} label={`#${tag}`} tone="blue" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};