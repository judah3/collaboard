import { Outlet } from "react-router-dom";
import { Sidebar } from "@/app/layout/Sidebar";
import { Topbar } from "@/app/layout/Topbar";

export const AppShell = () => {
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
