import { useEffect } from "react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { Sidebar } from "@/app/layout/Sidebar";
import { Topbar } from "@/app/layout/Topbar";
import { saveLastVisitedRoute } from "@/features/auth/lastVisitedRoute";

const isProjectBoardPath = (pathname: string) => /^\/projects\/[^/]+(?:\/board)?\/?$/.test(pathname);

export const AppShell = () => {
  const location = useLocation();
  const navigation = useNavigation();

  const isNavigatingToProjectBoard =
    navigation.state === "loading" &&
    Boolean(navigation.location?.pathname) &&
    isProjectBoardPath(navigation.location.pathname);

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
          {isNavigatingToProjectBoard ? (
            <section className="bg-slate-50 p-3 sm:p-4 lg:p-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading project board...</div>
            </section>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};
