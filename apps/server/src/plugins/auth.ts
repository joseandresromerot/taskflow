import { FastifyRequest, FastifyReply } from "fastify"

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.headers["x-user-id"]
  if (!userId || typeof userId !== "string") {
    return reply.status(401).send({ error: "Unauthorized" })
  }
  request.userId = userId
}

// Augment FastifyRequest to include userId
declare module "fastify" {
  interface FastifyRequest {
    userId: string
  }
}
