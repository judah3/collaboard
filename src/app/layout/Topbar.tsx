import { Bell, BriefcaseBusiness, Clock3, LogOut, Plus, Search } from "lucide-react";
import { Link, useLocation, useMatches } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { taskStoreSelectors, useTaskStore } from "@/features/tasks/taskStore";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { IconButton } from "@/shared/ui/IconButton";
import type { Project } from "@/features/projects/types";

type ProjectLoaderData = {
  project: Project;
  projectId: string;
};

export const Topbar = () => {
  const location = useLocation();
  const matches = useMatches();
  const { user, logout } = useAuth();
  const projectMatch = matches.find((match) => match.id === "project");
  const projectData = projectMatch?.data as ProjectLoaderData | undefined;
  const projectId = projectData?.projectId ?? "";
  const projectName = projectData?.project.name ?? "Workspace";
  const searchQuery = useTaskStore(taskStoreSelectors.searchQuery);
  const setSearchQuery = useTaskStore((state) => state.setSearchQuery);
  const onBoardPage = location.pathname.includes("/board");
  const showProjectBreadcrumb = location.pathname.includes("/projects/");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 backdrop-blur sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-2 text-slate-600">
        <BriefcaseBusiness className="h-4 w-4 text-slate-500" />
        {showProjectBreadcrumb ? (
          <>
            {projectId ? (
              <Link to={`/projects/${projectId}/board`} className="truncate text-base font-semibold text-slate-700">
                Project
              </Link>
            ) : (
              <span className="truncate text-base font-semibold text-slate-700">Project</span>
            )}
            <span className="text-slate-400">/</span>
            <span className="truncate text-base font-semibold text-slate-900">{projectName}</span>
          </>
        ) : (
          <span className="truncate text-base font-semibold text-slate-900">Project Management</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={onBoardPage ? searchQuery : ""}
            onChange={(event) => onBoardPage && setSearchQuery(event.target.value)}
            placeholder="Search"
            className="w-56 lg:w-64 pl-9"
          />
        </div>
        <IconButton aria-label="Notifications" className="h-8 w-8 border-transparent bg-transparent shadow-none">
          <Bell className="h-4 w-4" />
        </IconButton>
        <IconButton aria-label="Recent activity" className="relative h-8 w-8 border-transparent bg-transparent shadow-none">
          <Clock3 className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </IconButton>
        <Button variant="secondary" className="h-9 px-4">
          <Plus className="h-4 w-4" />
          Create
        </Button>
        <span className="hidden text-sm text-slate-600 md:inline">{user?.name ?? "User"}</span>
        <Button variant="ghost" className="h-9 px-3" onClick={() => void logout()}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
};
