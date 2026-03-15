import { FastifyInstance } from "fastify"
import { requireAuth } from "../../plugins/auth"
import { createLabel, updateLabel, deleteLabel } from "./labels.service"
import { createLabelSchema, updateLabelSchema } from "./labels.schema"

export async function labelsRoutes(app: FastifyInstance) {
  // POST /api/labels
  app.post("/", { preHandler: requireAuth }, async (request, reply) => {
    const body = createLabelSchema.parse(request.body)
    const label = await createLabel(body, request.userId)
    return reply.status(201).send(label)
  })

  // PATCH /api/labels/:id
  app.patch<{ Params: { id: string } }>("/:id", { preHandler: requireAuth }, async (request) => {
    const body = updateLabelSchema.parse(request.body)
    return updateLabel(request.params.id, body, request.userId)
  })

  // DELETE /api/labels/:id
  app.delete<{ Params: { id: string } }>("/:id", { preHandler: requireAuth }, async (request, reply) => {
    await deleteLabel(request.params.id, request.userId)
    return reply.status(204).send()
  })
}
