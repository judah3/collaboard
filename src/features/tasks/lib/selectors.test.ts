import { describe, expect, it } from "vitest";
import { mockTasks } from "@/features/tasks/mockTasks";
import { applyTaskFilters } from "@/features/tasks/lib/selectors";

describe("task selectors", () => {
  it("filters by assignee", () => {
    const filtered = applyTaskFilters(mockTasks, { searchQuery: "", assigneeFilter: "u3", tagFilter: "all" });
    expect(filtered.every((task) => task.assigneeId === "u3")).toBe(true);
  });

  it("filters by tag", () => {
    const filtered = applyTaskFilters(mockTasks, { searchQuery: "", assigneeFilter: "all", tagFilter: "Frontend" });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((task) => task.tags.includes("Frontend"))).toBe(true);
  });

  it("filters by combined query and tag", () => {
    const filtered = applyTaskFilters(mockTasks, { searchQuery: "docs", assigneeFilter: "all", tagFilter: "Backend" });
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toContain("Update README and docs");
  });
});