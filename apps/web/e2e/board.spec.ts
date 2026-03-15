import { test, expect } from "@playwright/test"

test.describe("Board", () => {
  let workspaceId: string
  let userId: string

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: "e2e/.auth/user.json" })
    const page = await context.newPage()

    const meRes = await page.request.get("http://localhost:3000/api/test/me")
    const meData = await meRes.json()
    userId = meData.userId

    const wsRes = await page.request.post("http://localhost:3001/api/workspaces", {
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      data: { name: "E2E Board Tests", slug: `e2e-board-ws-${Date.now()}` },
    })
    const workspace = await wsRes.json()
    workspaceId = workspace.id

    await context.close()
  })

  test("can create a board from workspace page", async ({ page }) => {
    await page.goto(`/dashboard/${workspaceId}`)
    await expect(page.getByRole("button", { name: /new board/i })).toBeVisible()

    await page.getByRole("button", { name: /new board/i }).click()
    await expect(page).toHaveURL(/\/board\//)
  })

  test("can add a column to a board", async ({ page }) => {
    const boardRes = await page.request.post("http://localhost:3001/api/boards", {
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      data: { name: "E2E Column Test Board", workspaceId },
    })
    const board = await boardRes.json()

    await page.goto(`/board/${board.id}`)
    await page.getByRole("button", { name: /add column/i }).click()
    await expect(page.getByText(/to do|untitled|new column/i)).toBeVisible()
  })

  test("can add a card to a column", async ({ page }) => {
    const boardRes = await page.request.post("http://localhost:3001/api/boards", {
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      data: { name: "E2E Card Test Board", workspaceId },
    })
    const board = await boardRes.json()

    await page.request.post("http://localhost:3001/api/columns", {
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      data: { name: "To Do", boardId: board.id, position: 0 },
    })

    await page.goto(`/board/${board.id}`)
    await page.getByRole("button", { name: /add card/i }).first().click()

    await page.getByPlaceholder("Card title...").fill("My E2E card")
    await page.getByRole("button", { name: /^add card$/i }).click()

    await expect(page.getByText("My E2E card")).toBeVisible()
  })
})
