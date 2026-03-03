import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { RepositoryContext, columnRepository, projectRepository, taskRepository } from "@/app/repositories";
import { ProjectLayoutContext } from "@/features/projects/context/ProjectLayoutContext";
import { mockProject } from "@/features/projects/mockProject";
import { ProjectBoardPage } from "@/pages/ProjectBoardPage";
import { useTaskStore } from "@/features/tasks/taskStore";

const renderBoard = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={client}>
      <RepositoryContext.Provider value={{ projectRepository, columnRepository, taskRepository }}>
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
      sortKey: "manual",
      activeCreateTaskColumnId: null,
      isCreateColumnOpen: false,
      newColumnDraft: "",
      editingTaskDraft: null,
      dragState: {
        activeTaskId: null,
        activeColumnId: null
      }
    });
  });

  it("opens and closes task drawer with escape", async () => {
    renderBoard();

    await screen.findByText("Design new dashboard UI");
    fireEvent.click(screen.getByText("Design new dashboard UI"));

    expect(screen.getByRole("dialog", { name: "Task details" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Task details" })).not.toBeInTheDocument();
    });
  });

  it("applies assignee and tag filters together", async () => {
    useTaskStore.getState().setAssigneeFilter("u3");
    useTaskStore.getState().setTagFilter("Frontend");

    renderBoard();

    expect(await screen.findByText("Revamp login page")).toBeInTheDocument();
    expect(screen.queryByText("Set up Kubernetes cluster")).not.toBeInTheDocument();
  });

  it("creates a new column", async () => {
    renderBoard();
    await screen.findByText("Design new dashboard UI");

    fireEvent.click(screen.getByRole("button", { name: "Add Column" }));
    const input = screen.getByPlaceholderText("Column name");
    fireEvent.change(input, { target: { value: "Ops Board" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Ops Board")).toBeInTheDocument();
  });

  it("creates and edits a task", async () => {
    const taskName = `Task ${Date.now()}`;
    const editedName = `${taskName} Updated`;

    renderBoard();
    await screen.findByText("Design new dashboard UI");

    fireEvent.click(screen.getAllByRole("button", { name: "Add Task" })[0]);
    fireEvent.change(screen.getByPlaceholderText("Task title"), { target: { value: taskName } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText(taskName)).toBeInTheDocument();

    fireEvent.click(screen.getByText(taskName));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const titleInput = screen.getByDisplayValue(taskName);
    fireEvent.change(titleInput, { target: { value: editedName } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const matches = await screen.findAllByText(editedName);
    expect(matches.length).toBeGreaterThan(0);
  });
});
