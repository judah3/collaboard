import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/app/layout/AppShell";
import { PublicOnlyRoute } from "@/app/routes/PublicOnlyRoute";
import { RequireAuth } from "@/app/routes/RequireAuth";
import { ProjectLayout } from "@/app/routes/ProjectLayout";
import { ProjectRouteErrorPage } from "@/app/routes/ProjectRouteErrorPage";
import { listViewLoader, projectLoader, settingsViewLoader, timelineViewLoader } from "@/app/routes/loaders";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ProjectBoardPage } from "@/pages/ProjectBoardPage";
import { DashboardPage, MyTasksPage, TeamsPage } from "@/pages/placeholders/AppSectionPlaceholderPages";
import { ProjectListPage } from "@/pages/placeholders/ProjectListPage";
import { ProjectSettingsPage } from "@/pages/placeholders/ProjectSettingsPage";
import { ProjectTimelinePage } from "@/pages/placeholders/ProjectTimelinePage";
import { WorkspacePage } from "@/pages/WorkspacePage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    )
  },
  {
    path: "/register",
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    )
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/projects/mad-dogs-portal/board" replace />
      },
      {
        path: "workspace",
        element: <WorkspacePage />
      },
      {
        path: "dashboard",
        element: <DashboardPage />
      },
      {
        path: "my-tasks",
        element: <MyTasksPage />
      },
      {
        path: "teams",
        element: <TeamsPage />
      },
      {
        path: "projects",
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
