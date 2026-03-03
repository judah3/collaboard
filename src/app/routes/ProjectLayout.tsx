import { Outlet, useLoaderData } from "react-router-dom";
import { ProjectTabs } from "@/features/projects/components/ProjectTabs";
import {
  ProjectLayoutContext,
  type ProjectLayoutContextValue
} from "@/features/projects/context/ProjectLayoutContext";
import { useProject } from "@/features/projects/hooks/useProject";
import { useProjectView } from "@/features/projects/hooks/useProjectView";
import { ProjectHeader } from "@/features/projects/ProjectHeader";

export const ProjectLayout = () => {
  const { project: initialProject, projectId } = useLoaderData() as Pick<ProjectLayoutContextValue, "project" | "projectId">;
  const currentView = useProjectView();
  const { data: project = initialProject } = useProject(projectId);

  return (
    <ProjectLayoutContext.Provider value={{ project, projectId, currentView }}>
      <div className="min-w-0 flex-1">
        <ProjectHeader project={project} />
        <ProjectTabs projectId={projectId} currentView={currentView} />
        <Outlet />
      </div>
    </ProjectLayoutContext.Provider>
  );
};
