import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import type { ProjectView } from "@/features/projects/context/ProjectLayoutContext";

export const useProjectView = (): ProjectView => {
  const { pathname } = useLocation();

  return useMemo(() => {
    if (pathname.includes("/timeline")) {
      return "timeline";
    }

    if (pathname.includes("/settings")) {
      return "settings";
    }

    if (pathname.includes("/list")) {
      return "list";
    }

    return "board";
  }, [pathname]);
};