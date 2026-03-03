import { CalendarDays } from "lucide-react";
import { mockProject } from "@/features/projects/mockProject";
import { formatDueDate } from "@/shared/lib/date";
import { Avatar } from "@/shared/ui/Avatar";

export const ProjectHeader = () => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">{mockProject.name}</h1>
          <p className="text-sm text-slate-600">{mockProject.description}</p>
        </div>

        <div className="flex min-w-[240px] flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {mockProject.members.map((member) => (
                <Avatar key={member.id} name={member.name} size="md" />
              ))}
            </div>
            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              Due: {formatDueDate(mockProject.dueDate)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${mockProject.progress}%` }} />
            </div>
            <span className="text-sm font-medium text-slate-600">{mockProject.progress}%</span>
          </div>
        </div>
      </div>
    </section>
  );
};