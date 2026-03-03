import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { RepositoryContext, projectRepository, taskRepository } from "@/app/repositories";
import { ProjectLayoutContext } from "@/features/projects/context/ProjectLayoutContext";
import { mockProject } from "@/features/projects/mockProject";
import { ProjectBoardPage } from "@/pages/ProjectBoardPage";
import { useTaskStore } from "@/features/tasks/taskStore";

const renderBoard = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={client}>
      <RepositoryContext.Provider value={{ projectRepository, taskRepository }}>
        <ProjectLayoutContext.Provider value={{ project: mockProject, projectId: mockProject.id, currentView: "board" }}>
          <ProjectBoardPage />
        </ProjectLayoutContext.Provider>
      </RepositoryContext.Provider>
    </QueryClientProvider>
  );
};

describe("ProjectBoardPage integration", () => {
  beforeEach(() => {
    useTaskStore.setState({
      selectedTaskId: null,
      isTaskDrawerOpen: false,
      searchQuery: "",
      assigneeFilter: "all",
      tagFilter: "all",
      sortKey: "manual"
    });
  });

  it("opens and closes task drawer with escape", async () => {
    renderBoard();

    await screen.findByText("Design new dashboard UI");
    fireEvent.click(screen.getByText("Design new dashboard UI"));

    expect(screen.getByRole("dialog", { name: "Task details" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(useTaskStore.getState().isTaskDrawerOpen).toBe(false);
    });
  });

  it("applies assignee and tag filters together", async () => {
    useTaskStore.getState().setAssigneeFilter("u3");
    useTaskStore.getState().setTagFilter("Frontend");

    renderBoard();

    expect(await screen.findByText("Revamp login page")).toBeInTheDocument();
    expect(screen.queryByText("Set up Kubernetes cluster")).not.toBeInTheDocument();
  });
});