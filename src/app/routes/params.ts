import type { ProjectRouteParams } from "@/app/routes/types";

export const readProjectId = (params: Partial<ProjectRouteParams>) => {
  if (!params.projectId) {
    throw new Response("Missing project id", { status: 400, statusText: "Bad Request" });
  }

  return params.projectId;
};