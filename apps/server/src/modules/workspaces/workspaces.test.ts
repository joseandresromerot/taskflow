import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { FastifyInstance } from "fastify"
import { buildApp, createTestUser, cleanupUser, testDb } from "../../test/helpers"

describe("Workspaces API", () => {
  let app: FastifyInstance
  let userId: string

  beforeAll(async () => {
    app = await buildApp()
    const user = await createTestUser()
    userId = user.id
  })

  afterAll(async () => {
    await cleanupUser(userId)
    await app.close()
  })

  describe("GET /api/workspaces", () => {
    it("returns 401 without auth header", async () => {
      const res = await app.inject({ method: "GET", url: "/api/workspaces" })
      expect(res.statusCode).toBe(401)
    })

    it("returns empty array when user has no workspaces", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/workspaces",
        headers: { "x-user-id": userId },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toEqual([])
    })
  })

  describe("POST /api/workspaces", () => {
    it("creates a workspace and returns 201", async () => {
      const slug = `my-workspace-${Date.now()}`
      const res = await app.inject({
        method: "POST",
        url: "/api/workspaces",
        headers: { "x-user-id": userId },
        payload: { name: "My Workspace", slug },
      })
      expect(res.statusCode).toBe(201)
      expect(res.json()).toMatchObject({ name: "My Workspace", slug })
    })

    it("returns 400 when name is missing", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/workspaces",
        headers: { "x-user-id": userId },
        payload: { slug: "no-name" },
      })
      expect(res.statusCode).toBe(400)
    })

    it("returns 400 when slug has invalid characters", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/workspaces",
        headers: { "x-user-id": userId },
        payload: { name: "Bad Slug", slug: "Bad Slug!" },
      })
      expect(res.statusCode).toBe(400)
    })

    it("workspace appears in GET after creation", async () => {
      const slug = `workspace-${Date.now()}`
      await app.inject({
        method: "POST",
        url: "/api/workspaces",
        headers: { "x-user-id": userId },
        payload: { name: "Listed Workspace", slug },
      })

      const res = await app.inject({
        method: "GET",
        url: "/api/workspaces",
        headers: { "x-user-id": userId },
      })

      const workspaces = res.json()
      expect(workspaces.some((w: { slug: string }) => w.slug === slug)).toBe(true)
    })
  })

  describe("PATCH /api/workspaces/:id", () => {
    it("renames a workspace", async () => {
      const created = await app.inject({
        method: "POST",
        url: "/api/workspaces",
        headers: { "x-user-id": userId },
        payload: { name: "Old Name", slug: `rename-test-${Date.now()}` },
      })
      const { id } = created.json()

      const res = await app.inject({
        method: "PATCH",
        url: `/api/workspaces/${id}`,
        headers: { "x-user-id": userId },
        payload: { name: "New Name" },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({ name: "New Name" })
    })

    it("returns 403 when user is not a member", async () => {
      const otherUser = await createTestUser()

      const created = await app.inject({
        method: "POST",
        url: "/api/workspaces",
        headers: { "x-user-id": userId },
        payload: { name: "Private", slug: `private-${Date.now()}` },
      })
      const { id } = created.json()

      const res = await app.inject({
        method: "PATCH",
        url: `/api/workspaces/${id}`,
        headers: { "x-user-id": otherUser.id },
        payload: { name: "Hacked" },
      })

      expect(res.statusCode).toBe(403)
      await cleanupUser(otherUser.id)
    })
  })

  describe("DELETE /api/workspaces/:id", () => {
    it("deletes a workspace and returns 204", async () => {
      const created = await app.inject({
        method: "POST",
        url: "/api/workspaces",
        headers: { "x-user-id": userId },
        payload: { name: "To Delete", slug: `delete-${Date.now()}` },
      })
      const { id } = created.json()

      const res = await app.inject({
        method: "DELETE",
        url: `/api/workspaces/${id}`,
        headers: { "x-user-id": userId },
      })

      expect(res.statusCode).toBe(204)
    })

    it("returns 404 after workspace is deleted", async () => {
      const created = await app.inject({
        method: "POST",
        url: "/api/workspaces",
        headers: { "x-user-id": userId },
        payload: { name: "Gone", slug: `gone-${Date.now()}` },
      })
      const { id } = created.json()

      await app.inject({
        method: "DELETE",
        url: `/api/workspaces/${id}`,
        headers: { "x-user-id": userId },
      })

      const res = await app.inject({
        method: "GET",
        url: `/api/workspaces/${id}`,
        headers: { "x-user-id": userId },
      })

      expect(res.statusCode).toBe(404)
    })
  })
})
