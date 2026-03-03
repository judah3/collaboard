import { redirect } from "react-router-dom";
import { projectRepository } from "@/app/repositories";
import { featureFlags, type FeatureFlag } from "@/app/middleware/featureFlags";

export const requireProjectExists = async (projectId: string) => {
  const project = await projectRepository.getProjectById(projectId);

  if (!project) {
    throw new Response("Project not found", { status: 404, statusText: "Not Found" });
  }

  return project;
};

export const requireFeatureFlag = (flag: FeatureFlag) => {
  if (!featureFlags[flag]) {
    throw redirect("/");
  }
};