import { test, expect } from "@playwright/test"

test.describe("Dashboard", () => {
  test("redirects to dashboard when authenticated", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test("shows greeting with user name", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.getByText(/good (morning|afternoon|evening), e2e/i)).toBeVisible()
  })

  test("shows 'New Workspace' button", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.getByRole("button", { name: /new workspace/i })).toBeVisible()
  })

  test("can create a new workspace", async ({ page }) => {
    await page.goto("/dashboard")

    const name = `E2E Workspace ${Date.now()}`

    await page.getByRole("button", { name: /new workspace/i }).click()
    await expect(page.getByRole("dialog")).toBeVisible()

    await page.getByPlaceholder("My Workspace").fill(name)
    await page.getByRole("button", { name: /^create$/i }).click()

    await expect(page.getByRole("dialog")).not.toBeVisible()
    await expect(page.getByText(name)).toBeVisible()
  })

  test("can navigate to a workspace", async ({ page }) => {
    await page.goto("/dashboard")

    const name = `E2E Nav Workspace ${Date.now()}`
    await page.getByRole("button", { name: /new workspace/i }).click()
    await page.getByPlaceholder("My Workspace").fill(name)
    await page.getByRole("button", { name: /^create$/i }).click()
    await expect(page.getByText(name)).toBeVisible()

    await page.getByText(name).click()
    await expect(page).toHaveURL(/\/dashboard\//)
  })
})
