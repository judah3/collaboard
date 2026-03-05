import { Check, ChevronDown, FolderKanban } from "lucide-react";
import type { Project } from "@/features/projects/types";
import { formatDueDate } from "@/shared/lib/date";
import { Avatar } from "@/shared/ui/Avatar";

export const ProjectHeader = ({ project }: { project: Project }) => {
  return (
    <section className="bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-4 sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <FolderKanban className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
            <p className="text-base text-slate-600">{project.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:outline-none">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-emerald-100 text-emerald-600">
              <Check className="h-3 w-3" />
            </span>
            Active
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          <div className="flex -space-x-2">
            {project.members.map((member) => (
              <Avatar key={member.id} name={member.name} size="md" />
            ))}
          </div>
          <span className="text-sm text-slate-600">Due: {formatDueDate(project.dueDate)}</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${project.progress}%` }} />
            </div>
            <span className="text-sm text-slate-600">{project.progress}%</span>
          </div>
        </div>
      </div>
    </section>
  );
};


