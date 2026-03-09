"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import { getSocket, joinBoard, leaveBoard, onBoardEvent } from "@/lib/socket"
import { Board, Card, WSEvent } from "@taskflow/types"

export const useBoard = (boardId: string, userId: string) => {
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchBoard = useCallback(async () => {
    try {
      const data = await api.get<Board>(`/api/boards/${boardId}`, { "x-user-id": userId })
      setBoard(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [boardId, userId])

  useEffect(() => {
    fetchBoard()

    const socket = getSocket()
    socket.connect()
    joinBoard(boardId)

    const offCardMoved = onBoardEvent<Card>(WSEvent.CARD_MOVED, () => fetchBoard())
    const offCardCreated = onBoardEvent<Card>(WSEvent.CARD_CREATED, () => fetchBoard())
    const offCardUpdated = onBoardEvent<Card>(WSEvent.CARD_UPDATED, () => fetchBoard())
    const offCardDeleted = onBoardEvent<Card>(WSEvent.CARD_DELETED, () => fetchBoard())
    const offColumnCreated = onBoardEvent(WSEvent.COLUMN_CREATED, () => fetchBoard())
    const offColumnReordered = onBoardEvent(WSEvent.COLUMN_REORDERED, () => fetchBoard())

    return () => {
      leaveBoard(boardId)
      socket.disconnect()
      offCardMoved()
      offCardCreated()
      offCardUpdated()
      offCardDeleted()
      offColumnCreated()
      offColumnReordered()
    }
  }, [boardId, fetchBoard])

  return { board, loading, refetch: fetchBoard }
}
