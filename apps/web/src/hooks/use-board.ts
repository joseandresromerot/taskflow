"use client"

import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { getSocket, joinBoard, leaveBoard, onBoardEvent } from "@/lib/socket"
import { Board, WSEvent } from "@taskflow/types"

export const boardQueryKey = (boardId: string) => ["board", boardId]

export const useBoard = (boardId: string, userId: string) => {
  const queryClient = useQueryClient()

  const { data: board, isLoading: loading } = useQuery({
    queryKey: boardQueryKey(boardId),
    queryFn: () => api.get<Board>(`/api/boards/${boardId}`, { "x-user-id": userId }),
  })

  useEffect(() => {
    const socket = getSocket()
    socket.connect()
    joinBoard(boardId)

    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: boardQueryKey(boardId) })

    const offCardCreated = onBoardEvent(WSEvent.CARD_CREATED, invalidate)
    const offCardUpdated = onBoardEvent(WSEvent.CARD_UPDATED, invalidate)
    const offCardMoved = onBoardEvent(WSEvent.CARD_MOVED, invalidate)
    const offCardDeleted = onBoardEvent(WSEvent.CARD_DELETED, invalidate)
    const offColumnCreated = onBoardEvent(WSEvent.COLUMN_CREATED, invalidate)
    const offColumnReordered = onBoardEvent(WSEvent.COLUMN_REORDERED, invalidate)

    return () => {
      leaveBoard(boardId)
      socket.disconnect()
      offCardCreated()
      offCardUpdated()
      offCardMoved()
      offCardDeleted()
      offColumnCreated()
      offColumnReordered()
    }
  }, [boardId, queryClient])

  const refetch = () => queryClient.invalidateQueries({ queryKey: boardQueryKey(boardId) })

  return { board, loading, refetch }
}
