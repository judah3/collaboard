import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth";

type PublicOnlyRouteProps = {
  children: ReactNode;
};

const MAIN_ROUTE = "/projects/mad-dogs-portal/board";

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
    return <Navigate to={MAIN_ROUTE} replace />;
  }

  return <>{children}</>;
};