import { test, expect, type Page } from "@playwright/test";

test.describe("Holds & meeting minutes", () => {
  test.skip(
    process.env.NEXT_PUBLIC_ENABLE_AUTH !== "true",
    "Requires NEXT_PUBLIC_ENABLE_AUTH=true against staging/local backend",
  );

  async function createProject(page: Page, name: string) {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: /project/i })).toBeVisible({
      timeout: 20_000,
    });

    await page.getByRole("link", { name: /new project|create project/i }).first().click();
    await expect(page).toHaveURL(/\/projects\/new/);

    await page.getByLabel(/project name|name/i).first().fill(name);
    await page.getByRole("button", { name: /create|save/i }).first().click();
    await expect(page).toHaveURL(/\/projects\/[^/]+/, { timeout: 30_000 });
  }

  test("create task hold → approve on hold-requests page", async ({ page }) => {
    const projectName = `E2E Hold ${Date.now()}`;
    await createProject(page, projectName);

    await page.getByRole("link", { name: /^tasks$/i }).first().click();
    await expect(page).toHaveURL(/\/tasks/);

    const addTask = page.getByRole("button", { name: /new task|add task/i }).first();
    await expect(addTask).toBeVisible({ timeout: 15_000 });
    await addTask.click();

    const taskTitle = `E2E hold task ${Date.now()}`;
    await page.getByLabel(/title/i).first().fill(taskTitle);
    await page.getByRole("button", { name: /add task|create|save/i }).last().click();
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 30_000 });

    await page.getByText(taskTitle).first().click();
    await expect(page.getByRole("button", { name: /request hold/i })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: /request hold/i }).click();

    await expect(page.getByRole("heading", { name: /request task hold/i })).toBeVisible();
    await page.getByPlaceholder(/why does this task need to be on hold/i).fill(
      "E2E hold reason — waiting on client",
    );
    await page.getByRole("button", { name: /submit request/i }).click();
    await expect(page.getByText(/hold request submitted/i)).toBeVisible({ timeout: 20_000 });

    await page.getByRole("link", { name: /hold requests/i }).first().click();
    await expect(page).toHaveURL(/\/hold-requests/);
    await expect(page.getByText(/e2e hold reason|waiting on client/i).first()).toBeVisible({
      timeout: 20_000,
    });

    const approve = page.getByRole("button", { name: /^approve$/i }).first();
    if (await approve.isVisible()) {
      await approve.click();
      await expect(page.getByText(/approved/i).first()).toBeVisible({ timeout: 20_000 });
    }
  });

  test("create meeting minute on project", async ({ page }) => {
    const projectName = `E2E Minutes ${Date.now()}`;
    await createProject(page, projectName);

    await page.getByRole("link", { name: /^minutes$/i }).first().click();
    await expect(page).toHaveURL(/\/minutes/);

    const newBtn = page.getByRole("button", { name: /^new$/i }).first();
    await expect(newBtn).toBeVisible({ timeout: 15_000 });
    await newBtn.click();

    const minuteTitle = `E2E Meeting ${Date.now()}`;
    await page.getByPlaceholder(/meeting title/i).fill(minuteTitle);
    await page.getByRole("button", { name: /publish/i }).click();

    await expect(page.getByText(minuteTitle).first()).toBeVisible({ timeout: 30_000 });
  });
});
