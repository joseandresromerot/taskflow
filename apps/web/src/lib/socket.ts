import { io, Socket } from "socket.io-client"
import { WSEvent, WSPayload } from "@taskflow/types"

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001"

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, { autoConnect: false })
  }
  return socket
}

export function joinBoard(boardId: string) {
  getSocket().emit("board:join", boardId)
}

export function leaveBoard(boardId: string) {
  getSocket().emit("board:leave", boardId)
}

export function onBoardEvent<T>(
  event: WSEvent,
  handler: (payload: WSPayload<T>) => void
): () => void {
  const s = getSocket()
  s.on(event, handler)
  return () => s.off(event, handler)
}
