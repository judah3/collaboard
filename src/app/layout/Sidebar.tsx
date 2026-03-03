import {
  ChevronDown,
  FolderKanban,
  FolderOpen,
  House,
  LayoutDashboard,
  ListChecks,
  Plus,
  Send,
  Users
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Avatar } from "@/shared/ui/Avatar";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";

const mainNav = [
  { label: "Workspace", icon: House },
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Tasks", icon: ListChecks },
  { label: "Projects", icon: FolderOpen },
  { label: "Teams", icon: Users }
];

const projectNav = ["Mad Dogs Portal", "AI CRM", "Website Revamp"];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-slate-50 shadow-[2px_0_12px_-10px_rgba(15,23,42,0.28)] lg:flex lg:flex-col">
      <div className="flex h-14 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
          <FolderKanban className="h-4 w-4" />
        </div>
        <span className="text-base font-semibold text-slate-900">Workspace</span>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden px-4 py-3">
        <nav className="flex flex-col gap-2">
          {mainNav.map((item) => {
            const isTeams = item.label === "Teams";
            return (
              <button
                key={item.label}
                className={cn(
                  "flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40",
                  isTeams && "bg-slate-100"
                )}
              >
                <item.icon className="h-4 w-4 text-slate-500" />
                <span className="flex-1">{item.label}</span>
                {item.label === "Projects" ? <ChevronDown className="h-4 w-4 text-slate-400" /> : null}
              </button>
            );
          })}
        </nav>

        <div className="mt-3 flex flex-col gap-2">
          {projectNav.map((project) => (
            <NavLink
              key={project}
              to="/projects/mad-dogs-portal/board"
              className={({ isActive }) =>
                cn(
                  "flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
                  isActive && project === "Mad Dogs Portal" && "bg-slate-100 text-slate-900"
                )
              }
            >
              <span
                className={cn(
                  "inline-flex h-4 w-4 items-center justify-center rounded text-[10px] font-semibold",
                  project === "Mad Dogs Portal" ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-500"
                )}
              >
                {project === "Mad Dogs Portal" ? "T" : "L"}
              </span>
              {project}
            </NavLink>
          ))}
          <button className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        <div className="mt-4 h-px bg-slate-200" />
        <div className="mt-4 flex flex-col gap-2">
          <button className="flex h-9 w-full items-center gap-2 rounded-lg bg-slate-100 px-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
            <Plus className="h-4 w-4" />
            Create Task
          </button>
          <button className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
            <Users className="h-4 w-4" />
            Invite Team
          </button>
        </div>

        <div className="mt-auto pt-4">
          <div className="mb-3 h-px bg-slate-200" />
          <div className="mb-2 flex items-center justify-between px-2">
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              <Plus className="h-4 w-4" />
            </button>
            <div className="flex -space-x-2">
              <Avatar name="Jude A." size="sm" />
              <Avatar name="Anna F." size="sm" />
              <Avatar name="Marco T." size="sm" />
            </div>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" className="h-10 flex-1 justify-center">
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
            <button className="inline-flex h-10 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
