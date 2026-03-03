import { describe, expect, it } from "vitest";
import { mockColumnRepository } from "@/features/board/mockColumnRepository";

describe("mockColumnRepository", () => {
  it("creates a unique column", async () => {
    const created = await mockColumnRepository.createColumn("mad-dogs-portal", { name: "Review" });
    expect(created.name).toBe("Review");
  });

  it("rejects duplicate names", async () => {
    await expect(mockColumnRepository.createColumn("mad-dogs-portal", { name: "Backlog" })).rejects.toThrow(
      "Column name already exists"
    );
  });
});