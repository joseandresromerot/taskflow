import Fastify, { FastifyInstance } from "fastify"
import { PrismaClient } from "@prisma/client"
import { corsPlugin } from "../plugins/cors"
import { setupWebSocket } from "../plugins/websocket"
import { setupErrorHandler } from "../plugins/error-handler"
import { workspacesRoutes } from "../modules/workspaces/workspaces.routes"
import { boardsRoutes } from "../modules/boards/boards.routes"
import { columnsRoutes } from "../modules/columns/columns.routes"
import { cardsRoutes } from "../modules/cards/cards.routes"

export const testDb = new PrismaClient()

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false })
  setupErrorHandler(app)
  await corsPlugin(app)
  setupWebSocket(app)
  await app.register(workspacesRoutes, { prefix: "/api/workspaces" })
  await app.register(boardsRoutes, { prefix: "/api/boards" })
  await app.register(columnsRoutes, { prefix: "/api/columns" })
  await app.register(cardsRoutes, { prefix: "/api/cards" })
  await app.ready()
  return app
}

export const createTestUser = async () => {
  return testDb.user.create({
    data: {
      email: `test-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`,
      name: "Test User",
    },
  })
}

export const cleanupUser = async (userId: string) => {
  await testDb.user.delete({ where: { id: userId } }).catch(() => null)
}
