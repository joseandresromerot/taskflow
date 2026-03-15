import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { FastifyInstance } from "fastify"
import { buildApp, createTestUser, cleanupUser } from "../../test/helpers"

describe("Boards API", () => {
  let app: FastifyInstance
  let userId: string
  let workspaceId: string

  beforeAll(async () => {
    app = await buildApp()
    const user = await createTestUser()
    userId = user.id

    const res = await app.inject({
      method: "POST",
      url: "/api/workspaces",
      headers: { "x-user-id": userId },
      payload: { name: "Test Workspace", slug: `boards-test-${Date.now()}` },
    })
    workspaceId = res.json().id
  })

  afterAll(async () => {
    await cleanupUser(userId)
    await app.close()
  })

  describe("POST /api/boards", () => {
    it("creates a board and returns 201", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/boards",
        headers: { "x-user-id": userId },
        payload: { name: "My Board", workspaceId },
      })
      expect(res.statusCode).toBe(201)
      expect(res.json()).toMatchObject({ name: "My Board", workspaceId })
    })

    it("returns 400 when workspaceId is missing", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/boards",
        headers: { "x-user-id": userId },
        payload: { name: "No Workspace" },
      })
      expect(res.statusCode).toBe(400)
    })

    it("returns 401 without auth header", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/boards",
        payload: { name: "Unauthorized", workspaceId },
      })
      expect(res.statusCode).toBe(401)
    })
  })

  describe("GET /api/boards/:id", () => {
    it("returns board with columns", async () => {
      const created = await app.inject({
        method: "POST",
        url: "/api/boards",
        headers: { "x-user-id": userId },
        payload: { name: "Board With Columns", workspaceId },
      })
      const { id } = created.json()

      const res = await app.inject({
        method: "GET",
        url: `/api/boards/${id}`,
        headers: { "x-user-id": userId },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({ id, name: "Board With Columns" })
      expect(res.json()).toHaveProperty("columns")
    })

    it("returns 404 for non-existent board", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/boards/clxxxxxxxxxxxxxxxxxxxxxxxx",
        headers: { "x-user-id": userId },
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe("PATCH /api/boards/:id", () => {
    it("renames a board", async () => {
      const created = await app.inject({
        method: "POST",
        url: "/api/boards",
        headers: { "x-user-id": userId },
        payload: { name: "Old Board Name", workspaceId },
      })
      const { id } = created.json()

      const res = await app.inject({
        method: "PATCH",
        url: `/api/boards/${id}`,
        headers: { "x-user-id": userId },
        payload: { name: "New Board Name" },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({ name: "New Board Name" })
    })
  })

  describe("DELETE /api/boards/:id", () => {
    it("deletes a board and returns 204", async () => {
      const created = await app.inject({
        method: "POST",
        url: "/api/boards",
        headers: { "x-user-id": userId },
        payload: { name: "Board To Delete", workspaceId },
      })
      const { id } = created.json()

      const res = await app.inject({
        method: "DELETE",
        url: `/api/boards/${id}`,
        headers: { "x-user-id": userId },
      })

      expect(res.statusCode).toBe(204)
    })

    it("returns 403 when user is not a workspace member", async () => {
      const otherUser = await createTestUser()

      const created = await app.inject({
        method: "POST",
        url: "/api/boards",
        headers: { "x-user-id": userId },
        payload: { name: "Private Board", workspaceId },
      })
      const { id } = created.json()

      const res = await app.inject({
        method: "DELETE",
        url: `/api/boards/${id}`,
        headers: { "x-user-id": otherUser.id },
      })

      expect(res.statusCode).toBe(403)
      await cleanupUser(otherUser.id)
    })
  })
})
