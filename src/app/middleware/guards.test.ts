import { describe, expect, it } from "vitest";
import { requireFeatureFlag, requireProjectExists } from "@/app/middleware/guards";

describe("route guards", () => {
  it("returns project when project exists", async () => {
    const project = await requireProjectExists("mad-dogs-portal");
    expect(project.name).toBe("Mad Dogs Portal");
  });

  it("throws response for missing project", async () => {
    await expect(requireProjectExists("unknown-project")).rejects.toBeInstanceOf(Response);
  });

  it("does not throw for enabled feature flags", () => {
    expect(() => requireFeatureFlag("boardView")).not.toThrow();
  });
});