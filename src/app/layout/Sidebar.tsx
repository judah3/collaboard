import { FolderKanban, Home, ListChecks, Plus, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";

const mainNav = [
  { label: "Workspace", icon: Home },
  { label: "Dashboard", icon: ListChecks },
  { label: "My Tasks", icon: ListChecks },
  { label: "Projects", icon: FolderKanban },
  { label: "Teams", icon: Users }
];

const projectNav = ["Mad Dogs Portal", "AI CRM", "Website Revamp"];

export const Sidebar = () => {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-50 lg:flex lg:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-slate-200 bg-slate-50 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
          <FolderKanban className="h-4 w-4" />
        </div>
        <span className="text-base font-semibold">Workspace</span>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-4">
        <nav className="flex flex-col gap-2">
          {mainNav.map((item) => (
            <button
              key={item.label}
              className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-2">
          {projectNav.map((project) => (
            <NavLink
              key={project}
              to="/projects/mad-dogs-portal/board"
              className={({ isActive }) =>
                cn(
                  "flex h-9 items-center rounded-lg px-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
                  isActive && project === "Mad Dogs Portal" && "bg-slate-100 text-slate-900"
                )
              }
            >
              {project}
            </NavLink>
          ))}
          <button className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      </div>

      <div className="border-t border-slate-200 p-4">
        <Button variant="primary" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>
    </aside>
  );
};
