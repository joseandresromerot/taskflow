import { Server } from "socket.io"
import { FastifyInstance } from "fastify"
import { WSEvent, WSPayload } from "@taskflow/types"

export function setupWebSocket(app: FastifyInstance) {
  const io = new Server(app.server, {
    cors: {
      origin: process.env.WEB_URL ?? "http://localhost:3000",
      credentials: true,
    },
  })

  io.on("connection", (socket) => {
    // Join a board room to receive real-time updates
    socket.on("board:join", (boardId: string) => {
      socket.join(`board:${boardId}`)
    })

    socket.on("board:leave", (boardId: string) => {
      socket.leave(`board:${boardId}`)
    })

    socket.on("disconnect", () => {
      // cleanup handled by socket.io automatically
    })
  })

  // Helper to emit events to all members of a board
  app.decorate("io", io)
  app.decorate("emitBoardEvent", <T>(payload: WSPayload<T>) => {
    io.to(`board:${payload.boardId}`).emit(payload.event, payload)
  })

  return io
}

// Augment Fastify types
declare module "fastify" {
  interface FastifyInstance {
    io: Server
    emitBoardEvent: <T>(payload: WSPayload<T>) => void
  }
}
