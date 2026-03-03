import type { LoaderFunctionArgs } from "react-router-dom";
import { requireFeatureFlag, requireProjectExists } from "@/app/middleware/guards";
import { readProjectId } from "@/app/routes/params";

export const projectLoader = async ({ params }: LoaderFunctionArgs) => {
  const projectId = readProjectId(params);

  const project = await requireProjectExists(projectId);

  return {
    project,
    projectId
  };
};

export const listViewLoader = async () => {
  requireFeatureFlag("listView");
  return null;
};

export const timelineViewLoader = async () => {
  requireFeatureFlag("timelineView");
  return null;
};

export const settingsViewLoader = async () => {
  requireFeatureFlag("settingsView");
  return null;
};
