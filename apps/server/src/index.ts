import Fastify from "fastify"
import { corsPlugin } from "./plugins/cors"
import { setupWebSocket } from "./plugins/websocket"
import { setupErrorHandler } from "./plugins/error-handler"
import { workspacesRoutes } from "./modules/workspaces/workspaces.routes"
import { boardsRoutes } from "./modules/boards/boards.routes"
import { columnsRoutes } from "./modules/columns/columns.routes"
import { cardsRoutes } from "./modules/cards/cards.routes"

const app = Fastify({
  logger: {
    transport:
      process.env.NODE_ENV === "development"
        ? { target: "pino-pretty" }
        : undefined,
  },
})

async function bootstrap() {
  // Plugins
  setupErrorHandler(app)
  await corsPlugin(app)
  setupWebSocket(app)

  // Health check
  app.get("/health", async () => ({ status: "ok" }))

  // Routes
  await app.register(workspacesRoutes, { prefix: "/api/workspaces" })
  await app.register(boardsRoutes, { prefix: "/api/boards" })
  await app.register(columnsRoutes, { prefix: "/api/columns" })
  await app.register(cardsRoutes, { prefix: "/api/cards" })

  const port = Number(process.env.SERVER_PORT) || 3001
  await app.listen({ port, host: "0.0.0.0" })
  app.log.info(`Server running on http://localhost:${port}`)
}

bootstrap().catch((err) => {
  process.stderr.write(`${err}\n`)
  process.exit(1)
})
