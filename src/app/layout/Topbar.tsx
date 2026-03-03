import { Bell, Plus, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTaskStore } from "@/features/tasks/taskStore";
import { Avatar } from "@/shared/ui/Avatar";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { IconButton } from "@/shared/ui/IconButton";

export const Topbar = () => {
  const location = useLocation();
  const searchQuery = useTaskStore((state) => state.searchQuery);
  const setSearchQuery = useTaskStore((state) => state.setSearchQuery);
  const onBoardPage = location.pathname.includes("/board");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-3 backdrop-blur sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-2 text-slate-600">
        <Link to="/projects/mad-dogs-portal/board" className="truncate text-base font-semibold text-slate-700">
          Project
        </Link>
        <span className="text-slate-400">/</span>
        <span className="truncate text-base font-semibold text-slate-900">Mad Dogs Portal</span>
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
        <IconButton aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </IconButton>
        <Avatar name="Jude A." size="md" />
        <Button variant="secondary" className="gap-2">
          <Plus className="h-4 w-4" />
          Create
        </Button>
      </div>
    </header>
  );
};
