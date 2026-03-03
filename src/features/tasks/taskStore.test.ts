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
      sortKey: "manual"
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
});