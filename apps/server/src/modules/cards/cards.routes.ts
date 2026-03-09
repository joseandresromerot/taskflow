import { FastifyInstance } from "fastify"
import { requireAuth } from "../../plugins/auth"
import {
  createCard,
  updateCard,
  moveCard,
  deleteCard,
  assignUser,
  unassignUser,
  addLabel,
  removeLabel,
  getCardActivity,
} from "./cards.service"
import {
  createCardSchema,
  updateCardSchema,
  moveCardSchema,
  assignUserSchema,
  addLabelSchema,
} from "./cards.schema"
import { WSEvent } from "@taskflow/types"

export async function cardsRoutes(app: FastifyInstance) {
  // POST /api/cards
  app.post("/", { preHandler: requireAuth }, async (request, reply) => {
    const body = createCardSchema.parse(request.body)
    const card = await createCard(body, request.userId)
    return reply.status(201).send(card)
  })

  // PATCH /api/cards/:id
  app.patch<{ Params: { id: string } }>("/:id", { preHandler: requireAuth }, async (request) => {
    const body = updateCardSchema.parse(request.body)
    const card = await updateCard(request.params.id, body, request.userId)
    return card
  })

  // POST /api/cards/:id/move
  app.post<{ Params: { id: string } }>("/:id/move", { preHandler: requireAuth }, async (request) => {
    const body = moveCardSchema.parse(request.body)
    const card = await moveCard(request.params.id, body, request.userId)
    app.emitBoardEvent({ event: WSEvent.CARD_MOVED, boardId: body.boardId, data: card })
    return card
  })

  // DELETE /api/cards/:id
  app.delete<{ Params: { id: string } }>("/:id", { preHandler: requireAuth }, async (request, reply) => {
    await deleteCard(request.params.id, request.userId)
    return reply.status(204).send()
  })

  // POST /api/cards/:id/assignees
  app.post<{ Params: { id: string } }>("/:id/assignees", { preHandler: requireAuth }, async (request, reply) => {
    const body = assignUserSchema.parse(request.body)
    await assignUser(request.params.id, body, request.userId)
    return reply.status(204).send()
  })

  // DELETE /api/cards/:id/assignees/:userId
  app.delete<{ Params: { id: string; userId: string } }>(
    "/:id/assignees/:userId",
    { preHandler: requireAuth },
    async (request, reply) => {
      await unassignUser(request.params.id, request.params.userId, request.userId)
      return reply.status(204).send()
    }
  )

  // POST /api/cards/:id/labels
  app.post<{ Params: { id: string } }>("/:id/labels", { preHandler: requireAuth }, async (request, reply) => {
    const body = addLabelSchema.parse(request.body)
    await addLabel(request.params.id, body, request.userId)
    return reply.status(204).send()
  })

  // DELETE /api/cards/:id/labels/:labelId
  app.delete<{ Params: { id: string; labelId: string } }>(
    "/:id/labels/:labelId",
    { preHandler: requireAuth },
    async (request, reply) => {
      await removeLabel(request.params.id, request.params.labelId, request.userId)
      return reply.status(204).send()
    }
  )

  // GET /api/cards/:id/activity
  app.get<{ Params: { id: string } }>("/:id/activity", { preHandler: requireAuth }, async (request) => {
    return getCardActivity(request.params.id, request.userId)
  })
}
