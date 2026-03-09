import { FastifyInstance } from "fastify"
import { requireAuth } from "../../plugins/auth"
import { getBoards, getBoard, createBoard, updateBoard, deleteBoard } from "./boards.service"
import { createBoardSchema, updateBoardSchema } from "./boards.schema"

export async function boardsRoutes(app: FastifyInstance) {
  // GET /api/boards?workspaceId=...
  app.get<{ Querystring: { workspaceId: string } }>(
    "/",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { workspaceId } = request.query
      if (!workspaceId) return reply.status(400).send({ error: "workspaceId is required" })
      return getBoards(workspaceId, request.userId)
    }
  )

  // GET /api/boards/:id
  app.get<{ Params: { id: string } }>("/:id", { preHandler: requireAuth }, async (request, reply) => {
    const board = await getBoard(request.params.id, request.userId)
    if (!board) return reply.status(404).send({ error: "Not found" })
    return board
  })

  // POST /api/boards
  app.post("/", { preHandler: requireAuth }, async (request, reply) => {
    const body = createBoardSchema.parse(request.body)
    return reply.status(201).send(await createBoard(body, request.userId))
  })

  // PATCH /api/boards/:id
  app.patch<{ Params: { id: string } }>("/:id", { preHandler: requireAuth }, async (request) => {
    const body = updateBoardSchema.parse(request.body)
    return updateBoard(request.params.id, body, request.userId)
  })

  // DELETE /api/boards/:id
  app.delete<{ Params: { id: string } }>("/:id", { preHandler: requireAuth }, async (request, reply) => {
    await deleteBoard(request.params.id, request.userId)
    return reply.status(204).send()
  })
}
