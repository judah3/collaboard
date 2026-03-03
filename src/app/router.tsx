import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppProviders } from "@/app/providers";
import { AppShell } from "@/app/layout/AppShell";
import { ProjectBoardPage } from "@/pages/ProjectBoardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppProviders>
        <AppShell />
      </AppProviders>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/projects/mad-dogs-portal/board" replace />
      },
      {
        path: "projects/:projectId/board",
        element: <ProjectBoardPage />
      }
    ]
  }
]);