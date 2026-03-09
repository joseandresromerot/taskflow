import { FastifyInstance } from "fastify"
import { requireAuth } from "../../plugins/auth"
import {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  updateMemberRole,
} from "./workspaces.service"
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from "./workspaces.schema"

export async function workspacesRoutes(app: FastifyInstance) {
  // GET /api/workspaces
  app.get("/", { preHandler: requireAuth }, async (request) => {
    return getWorkspaces(request.userId)
  })

  // GET /api/workspaces/:id
  app.get<{ Params: { id: string } }>("/:id", { preHandler: requireAuth }, async (request, reply) => {
    const workspace = await getWorkspace(request.params.id, request.userId)
    if (!workspace) return reply.status(404).send({ error: "Not found" })
    return workspace
  })

  // POST /api/workspaces
  app.post("/", { preHandler: requireAuth }, async (request, reply) => {
    const body = createWorkspaceSchema.parse(request.body)
    const workspace = await createWorkspace(body, request.userId)
    return reply.status(201).send(workspace)
  })

  // PATCH /api/workspaces/:id
  app.patch<{ Params: { id: string } }>("/:id", { preHandler: requireAuth }, async (request) => {
    const body = updateWorkspaceSchema.parse(request.body)
    return updateWorkspace(request.params.id, body, request.userId)
  })

  // DELETE /api/workspaces/:id
  app.delete<{ Params: { id: string } }>("/:id", { preHandler: requireAuth }, async (request, reply) => {
    await deleteWorkspace(request.params.id, request.userId)
    return reply.status(204).send()
  })

  // POST /api/workspaces/:id/members
  app.post<{ Params: { id: string } }>("/:id/members", { preHandler: requireAuth }, async (request, reply) => {
    const body = inviteMemberSchema.parse(request.body)
    return reply.status(201).send(await inviteMember(request.params.id, body, request.userId))
  })

  // PATCH /api/workspaces/:id/members/:memberId
  app.patch<{ Params: { id: string; memberId: string } }>(
    "/:id/members/:memberId",
    { preHandler: requireAuth },
    async (request) => {
      const body = updateMemberRoleSchema.parse(request.body)
      return updateMemberRole(request.params.id, request.params.memberId, body, request.userId)
    }
  )

  // DELETE /api/workspaces/:id/members/:memberId
  app.delete<{ Params: { id: string; memberId: string } }>(
    "/:id/members/:memberId",
    { preHandler: requireAuth },
    async (request, reply) => {
      await removeMember(request.params.id, request.params.memberId, request.userId)
      return reply.status(204).send()
    }
  )
}
