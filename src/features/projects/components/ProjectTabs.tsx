import { Kanban, List, Rows3, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { ProjectView } from "@/features/projects/context/ProjectLayoutContext";
import { cn } from "@/shared/lib/cn";

type ProjectTabsProps = {
  projectId: string;
  currentView: ProjectView;
};

const tabs = [
  { key: "board", label: "Board", icon: Kanban, path: "board" },
  { key: "list", label: "List", icon: List, path: "list" },
  { key: "timeline", label: "Timeline", icon: Rows3, path: "timeline" },
  { key: "settings", label: "Settings", icon: Settings, path: "settings" }
] as const;

export const ProjectTabs = ({ projectId, currentView }: ProjectTabsProps) => {
  return (
    <div className="bg-white px-3 py-3 sm:px-4 lg:px-6">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.key}
            to={`/projects/${projectId}/${tab.path}`}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus:outline-none",
              currentView === tab.key
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
};


