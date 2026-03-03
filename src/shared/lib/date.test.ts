import { expect, test } from "vitest";
import { formatDueDate } from "@/shared/lib/date";

test("formatDueDate returns month and day", () => {
  expect(formatDueDate("2026-04-10")).toMatch(/Apr\s10/);
});