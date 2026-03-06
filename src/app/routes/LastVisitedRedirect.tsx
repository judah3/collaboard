import { Navigate } from "react-router-dom";
import { getDefaultRoute } from "@/features/auth/lastVisitedRoute";

export const LastVisitedRedirect = () => <Navigate to={getDefaultRoute()} replace />;
