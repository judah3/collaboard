import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { getDefaultRoute } from "@/features/auth/lastVisitedRoute";

type PublicOnlyRouteProps = {
  children: ReactNode;
};

export const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-sm text-slate-600">
        Checking your session...
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to={getDefaultRoute()} replace />;
  }

  return <>{children}</>;
};
