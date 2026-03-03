import { expect, test } from "@playwright/test";

test("board smoke flow", async ({ page }) => {
  await page.goto("/projects/mad-dogs-portal/board");

  await expect(page.getByRole("heading", { name: "Mad Dogs Portal" })).toBeVisible();
  await page.getByText("Design new dashboard UI").click();
  await expect(page.getByRole("dialog", { name: "Task details" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Task details" })).toBeHidden();
});
