import { expect, test } from "vitest";
import { cn } from "@/shared/lib/cn";

test("cn merges tailwind utility conflicts", () => {
  expect(cn("px-2", "px-4", "text-sm")).toBe("px-4 text-sm");
});