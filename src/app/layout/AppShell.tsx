import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/app/layout/Sidebar";
import { Topbar } from "@/app/layout/Topbar";
import { saveLastVisitedRoute } from "@/features/auth/lastVisitedRoute";

export const AppShell = () => {
  const location = useLocation();

  useEffect(() => {
    const route = `${location.pathname}${location.search}${location.hash}`;
    saveLastVisitedRoute(route);
  }, [location.hash, location.pathname, location.search]);

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:ml-64">
        <Topbar />
        <main className="min-w-0 flex-1 p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
