import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppProviders } from "@/app/providers";
import { AppShell } from "@/app/layout/AppShell";
import { ProjectLayout } from "@/app/routes/ProjectLayout";
import { ProjectRouteErrorPage } from "@/app/routes/ProjectRouteErrorPage";
import { listViewLoader, projectLoader, settingsViewLoader, timelineViewLoader } from "@/app/routes/loaders";
import { ProjectBoardPage } from "@/pages/ProjectBoardPage";
import { ProjectListPage } from "@/pages/placeholders/ProjectListPage";
import { ProjectSettingsPage } from "@/pages/placeholders/ProjectSettingsPage";
import { ProjectTimelinePage } from "@/pages/placeholders/ProjectTimelinePage";

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
        id: "project",
        path: "projects/:projectId",
        loader: projectLoader,
        errorElement: <ProjectRouteErrorPage />,
        element: <ProjectLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="board" replace />
          },
          {
            path: "board",
            element: <ProjectBoardPage />
          },
          {
            path: "list",
            loader: listViewLoader,
            element: <ProjectListPage />
          },
          {
            path: "timeline",
            loader: timelineViewLoader,
            element: <ProjectTimelinePage />
          },
          {
            path: "settings",
            loader: settingsViewLoader,
            element: <ProjectSettingsPage />
          }
        ]
      }
    ]
  }
]);