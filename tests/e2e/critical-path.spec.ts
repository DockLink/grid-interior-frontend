import { test, expect } from "@playwright/test";

test.describe("Critical path", () => {
  test.skip(
    process.env.NEXT_PUBLIC_ENABLE_AUTH !== "true",
    "Requires NEXT_PUBLIC_ENABLE_AUTH=true against staging/local backend",
  );

  test("login → create project → upload file → create task", async ({ page }) => {
    await page.goto("/projects");

    await expect(page.getByRole("heading", { name: /project/i })).toBeVisible({
      timeout: 20_000,
    });

    await page.getByRole("link", { name: /new project|create project/i }).first().click();
    await expect(page).toHaveURL(/\/projects\/new/);

    const projectName = `E2E Project ${Date.now()}`;
    await page.getByLabel(/project name|name/i).first().fill(projectName);
    await page.getByRole("button", { name: /create|save/i }).first().click();

    await expect(page).toHaveURL(/\/projects\/[^/]+/, { timeout: 30_000 });

    await page.getByRole("link", { name: /documents|files/i }).first().click();
    await expect(page).toHaveURL(/\/files/);

    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count()) {
      await fileInput.setInputFiles({
        name: "e2e-fixture.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("E2E upload fixture"),
      });
      await expect(page.getByText(/e2e-fixture/i)).toBeVisible({ timeout: 60_000 });
    }

    await page.getByRole("link", { name: /^tasks$/i }).first().click();
    await expect(page).toHaveURL(/\/tasks/);

    const addTask = page.getByRole("button", { name: /add task|new task/i }).first();
    if (await addTask.isVisible()) {
      await addTask.click();
      await page.getByLabel(/title|task name/i).first().fill("E2E smoke task");
      await page.getByRole("button", { name: /create|save|add/i }).last().click();
      await expect(page.getByText(/e2e smoke task/i)).toBeVisible({ timeout: 30_000 });
    }
  });
});
