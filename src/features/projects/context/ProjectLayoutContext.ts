import { createContext, useContext } from "react";
import type { Project } from "@/features/projects/types";

export type ProjectView = "board" | "list" | "timeline" | "settings";

export type ProjectLayoutContextValue = {
  project: Project;
  projectId: string;
  currentView: ProjectView;
};

export const ProjectLayoutContext = createContext<ProjectLayoutContextValue | null>(null);

export const useProjectLayoutContext = () => {
  const context = useContext(ProjectLayoutContext);

  if (!context) {
    throw new Error("useProjectLayoutContext must be used within ProjectLayoutContext.Provider");
  }

  return context;
};