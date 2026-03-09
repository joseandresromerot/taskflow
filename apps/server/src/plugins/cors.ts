import cors from "@fastify/cors"
import { FastifyInstance } from "fastify"

export async function corsPlugin(app: FastifyInstance) {
  await app.register(cors, {
    origin: process.env.WEB_URL ?? "http://localhost:3000",
    credentials: true,
  })
}
