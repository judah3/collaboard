import { redirect } from "react-router-dom";
import { projectRepository } from "@/app/repositories";
import { featureFlags, type FeatureFlag } from "@/app/middleware/featureFlags";

export const requireProjectExists = async (projectId: string) => {
  let project: Awaited<ReturnType<typeof projectRepository.getProjectById>>;

  try {
    project = await projectRepository.getProjectById(projectId);
  } catch (error) {
    if (error instanceof Error) {
      const normalized = error.message.toLowerCase();
      if (normalized.includes("missing auth access token") || normalized.includes("status 401")) {
        throw redirect("/login");
      }
    }
    throw error;
  }

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
