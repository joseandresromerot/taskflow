import { test as setup, expect } from "@playwright/test"
import path from "path"

const authFile = path.join(__dirname, "../.auth/user.json")

setup("create authenticated session", async ({ page }) => {
  await page.goto("/api/test/auth")
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 })
  await page.context().storageState({ path: authFile })
})
