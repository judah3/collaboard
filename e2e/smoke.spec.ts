import { expect, test } from "@playwright/test";

test("board smoke flow", async ({ page }) => {
  const taskName = `Smoke Task ${Date.now()}`;
  const editedName = `${taskName} Edited`;

  await page.goto("/projects/mad-dogs-portal/board");

  await expect(page.getByRole("heading", { name: "Mad Dogs Portal" })).toBeVisible();

  await page.getByRole("button", { name: "Add Column" }).click();
  await page.getByPlaceholder("Column name").fill("Smoke Column");
  await page.getByPlaceholder("Column name").locator("xpath=ancestor::section[1]").getByRole("button", { name: "Create" }).click();
  await expect(page.getByText("Smoke Column")).toBeVisible();

  await page.locator('[data-column-id="col-backlog"]').getByRole("button", { name: "Add Task" }).first().click();
  await page.getByPlaceholder("Task title").fill(taskName);
  await page.getByPlaceholder("Task title").locator("xpath=ancestor::div[1]").getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(taskName)).toBeVisible();

  await page.getByText(taskName).click();
  await page.getByRole("button", { name: "Edit" }).click();
  const drawer = page.getByRole("dialog", { name: "Task details" });
  await drawer.locator("input").first().fill(editedName);
  await drawer.getByRole("button", { name: "Save" }).click();
  await drawer.getByRole("button", { name: "Close task detail drawer" }).click();
  await expect(page.locator('[data-column-id="col-backlog"]').getByText(editedName)).toBeVisible();

  const taskCard = page.locator('[data-task-drag-id^="task_"]').filter({ hasText: editedName }).first();
  const targetColumn = page.locator('[data-column-id="col-in-progress"] [data-task-drag-id]').first();
  const sourceBox = await taskCard.boundingBox();
  const targetBox = await targetColumn.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error("Unable to resolve drag source/target bounds");
  }

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 12 });
  await page.mouse.up();

  await expect(page.locator('[data-column-id="col-in-progress"]').getByText(editedName)).toBeVisible();
});
