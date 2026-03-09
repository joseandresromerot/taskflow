import { FastifyInstance } from "fastify"
import { requireAuth } from "../../plugins/auth"
import { createColumn, updateColumn, deleteColumn, reorderColumns } from "./columns.service"
import { createColumnSchema, updateColumnSchema, reorderColumnsSchema } from "./columns.schema"
import { WSEvent } from "@taskflow/types"

export async function columnsRoutes(app: FastifyInstance) {
  // POST /api/columns
  app.post("/", { preHandler: requireAuth }, async (request, reply) => {
    const body = createColumnSchema.parse(request.body)
    const column = await createColumn(body, request.userId)
    app.emitBoardEvent({ event: WSEvent.COLUMN_CREATED, boardId: body.boardId, data: column })
    return reply.status(201).send(column)
  })

  // PATCH /api/columns/:id
  app.patch<{ Params: { id: string } }>("/:id", { preHandler: requireAuth }, async (request) => {
    const body = updateColumnSchema.parse(request.body)
    return updateColumn(request.params.id, body, request.userId)
  })

  // DELETE /api/columns/:id
  app.delete<{ Params: { id: string } }>("/:id", { preHandler: requireAuth }, async (request, reply) => {
    await deleteColumn(request.params.id, request.userId)
    return reply.status(204).send()
  })

  // POST /api/columns/reorder
  app.post<{ Body: { boardId: string; columnIds: string[] } }>(
    "/reorder",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { boardId, ...rest } = request.body as { boardId: string; columnIds: string[] }
      const body = reorderColumnsSchema.parse(rest)
      await reorderColumns(boardId, body, request.userId)
      app.emitBoardEvent({ event: WSEvent.COLUMN_REORDERED, boardId, data: body.columnIds })
      return reply.status(204).send()
    }
  )
}
