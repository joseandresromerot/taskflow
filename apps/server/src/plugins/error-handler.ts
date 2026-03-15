import { FastifyInstance } from "fastify"
import { ZodError } from "zod"
import { HttpError } from "../lib/errors"

export const setupErrorHandler = (app: FastifyInstance) => {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "Validation failed",
        details: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
      })
    }

    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({ error: error.message })
    }

    app.log.error(error)
    return reply.status(500).send({ error: "Internal server error" })
  })
}
