import { beforeEach, describe, expect, it } from "vitest";
import { useTaskStore } from "@/features/tasks/taskStore";

describe("task store", () => {
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

  it("openTaskDrawer sets selected task and opens drawer", () => {
    useTaskStore.getState().openTaskDrawer("t1");

    expect(useTaskStore.getState().selectedTaskId).toBe("t1");
    expect(useTaskStore.getState().isTaskDrawerOpen).toBe(true);
  });

  it("closeTaskDrawer clears selected task", () => {
    useTaskStore.getState().openTaskDrawer("t1");
    useTaskStore.getState().closeTaskDrawer();

    expect(useTaskStore.getState().selectedTaskId).toBeNull();
    expect(useTaskStore.getState().isTaskDrawerOpen).toBe(false);
  });

  it("setters preserve unrelated state", () => {
    useTaskStore.getState().openTaskDrawer("t6");
    useTaskStore.getState().setTagFilter("Frontend");

    expect(useTaskStore.getState().selectedTaskId).toBe("t6");
    expect(useTaskStore.getState().tagFilter).toBe("Frontend");
  });

  it("inline task create state opens and closes", () => {
    useTaskStore.getState().openCreateTaskInline("col-backlog");
    expect(useTaskStore.getState().activeCreateTaskColumnId).toBe("col-backlog");

    useTaskStore.getState().closeCreateTaskInline();
    expect(useTaskStore.getState().activeCreateTaskColumnId).toBeNull();
  });

  it("task draft lifecycle is managed", () => {
    useTaskStore.getState().startTaskEdit({
      id: "t1",
      projectId: "mad-dogs-portal",
      columnId: "col-backlog",
      order: 0,
      title: "Old",
      description: "",
      priority: "Low",
      assigneeId: "u1",
      dueDate: "2026-03-10",
      tags: [],
      commentsCount: 0,
      attachmentsCount: 0,
      comments: []
    });

    useTaskStore.getState().updateTaskDraft({ title: "New" });
    expect(useTaskStore.getState().editingTaskDraft?.title).toBe("New");

    useTaskStore.getState().cancelTaskEdit();
    expect(useTaskStore.getState().editingTaskDraft).toBeNull();
  });
});