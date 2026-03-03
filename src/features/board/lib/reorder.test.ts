import { describe, expect, it } from "vitest";
import { reorderColumnsLocally, reorderTasksLocally } from "@/features/board/lib/reorder";
import { mockColumns } from "@/features/board/mockColumns";
import { mockTasks } from "@/features/tasks/mockTasks";

describe("reorder helpers", () => {
  it("reorders columns", () => {
    const reordered = reorderColumnsLocally(mockColumns, "col-backlog", "col-completed");
    expect(reordered[2].id).toBe("col-backlog");
  });

  it("reorders tasks within same column", () => {
    const sameColumnTasks = mockTasks.filter((task) => task.columnId === "col-backlog");
    const target = sameColumnTasks[0];
    const reordered = reorderTasksLocally(mockTasks, target.id, "col-backlog", sameColumnTasks.length - 1);
    const backlog = reordered.filter((task) => task.columnId === "col-backlog").sort((a, b) => a.order - b.order);
    expect(backlog[backlog.length - 1].id).toBe(target.id);
  });

  it("moves task across columns", () => {
    const task = mockTasks.find((item) => item.columnId === "col-backlog");
    if (!task) throw new Error("seed task missing");

    const reordered = reorderTasksLocally(mockTasks, task.id, "col-in-progress", 0);
    const moved = reordered.find((item) => item.id === task.id);
    expect(moved?.columnId).toBe("col-in-progress");
    expect(moved?.order).toBe(0);
  });
});