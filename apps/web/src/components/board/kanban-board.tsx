"use client"

import { useState, useRef } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useBoard, boardQueryKey } from "@/hooks/use-board"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { CardDetailSheet } from "./card-detail-sheet"
import { LabelsPopover } from "./labels-popover"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Tag } from "lucide-react"
import { api } from "@/lib/api"
import { Board, Column, Card, Label } from "@taskflow/types"
import { toast } from "sonner"

type KanbanBoardProps = {
  boardId: string
  userId: string
}

type MoveCardVars = {
  cardId: string
  columnId: string
  position: number
  sourceColId: string
  overCardId: string | null
}

export const KanbanBoard = ({ boardId, userId }: KanbanBoardProps) => {
  const { board, loading, refetch } = useBoard(boardId, userId)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [renamingBoard, setRenamingBoard] = useState(false)
  const [boardName, setBoardName] = useState("")
  const [showLabels, setShowLabels] = useState(false)
  const boardNameRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  const moveCard = useMutation({
    mutationFn: ({ cardId, columnId, position }: MoveCardVars) =>
      api.post(`/api/cards/${cardId}/move`, { columnId, position, boardId }, { "x-user-id": userId }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardQueryKey(boardId) })
    },
  })

  const handleRenameBoard = async () => {
    const name = boardName.trim()
    setRenamingBoard(false)
    if (!name || name === board?.name) return
    try {
      await api.patch(`/api/boards/${boardId}`, { name }, { "x-user-id": userId })
      refetch()
    } catch {
      toast.error("Failed to rename board")
    }
  }

  const handleAddColumn = async () => {
    await api.post("/api/columns", { boardId, name: "New Column" }, { "x-user-id": userId })
    refetch()
  }

  const handleDragStart = ({ active }: DragStartEvent) => {
    const card = board?.columns?.flatMap((col) => col.cards ?? []).find((c) => c.id === active.id)
    setActiveCard(card ?? null)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCard(null)
    if (!over || active.id === over.id || !board) return

    const cardId = String(active.id)
    const targetCol = board.columns?.find(
      (col) => col.id === over.id || col.cards?.some((c) => c.id === over.id)
    )
    if (!targetCol) return

    const targetCards = targetCol.cards ?? []
    const overIndex = targetCards.findIndex((c) => c.id === over.id)
    const position = overIndex === -1 ? targetCards.length : overIndex
    const overCardId = over.id !== targetCol.id ? String(over.id) : null

    // Optimistic update — synchronous, no async delays
    const previous = queryClient.getQueryData<Board>(boardQueryKey(boardId))
    queryClient.setQueryData<Board>(boardQueryKey(boardId), (old) => {
      if (!old?.columns) return old
      const cols = old.columns.map((col) => ({ ...col, cards: [...(col.cards ?? [])] }))
      const src = cols.find((col) => col.cards.some((c) => c.id === cardId))
      const tgt = cols.find((col) => col.id === targetCol.id)
      if (!src || !tgt) return old
      const cardIdx = src.cards.findIndex((c) => c.id === cardId)
      const [card] = src.cards.splice(cardIdx, 1)
      const insertAt = overCardId ? tgt.cards.findIndex((c) => c.id === overCardId) : -1
      tgt.cards.splice(insertAt === -1 ? tgt.cards.length : insertAt, 0, card)
      return { ...old, columns: cols }
    })

    moveCard.mutate(
      { cardId, columnId: targetCol.id, position, sourceColId: cardId, overCardId },
      { onError: () => queryClient.setQueryData(boardQueryKey(boardId), previous) }
    )
  }

  if (loading) {
    return (
      <div className="flex gap-4 p-6 overflow-x-auto h-full">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-72 h-96 shrink-0 rounded-xl bg-[#111111]" />
        ))}
      </div>
    )
  }

  if (!board) return null

  const columnIds = board.columns?.map((col) => col.id) ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Board header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-[#1F1F1F]">
        {renamingBoard ? (
          <input
            ref={boardNameRef}
            autoFocus
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            onBlur={handleRenameBoard}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameBoard()
              if (e.key === "Escape") setRenamingBoard(false)
            }}
            className="bg-transparent text-white text-lg font-semibold focus:outline-none border-b border-indigo-500"
          />
        ) : (
          <h1 className="text-white text-lg font-semibold">{board.name}</h1>
        )}
        {!renamingBoard && (
          <>
            <button
              onClick={() => { setBoardName(board.name); setRenamingBoard(true) }}
              className="text-[#71717A] hover:text-white transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowLabels((v) => !v)}
                className="flex items-center gap-1.5 text-[#71717A] hover:text-white transition-colors text-xs"
              >
                <Tag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Labels</span>
              </button>
              {showLabels && (
                <LabelsPopover
                  boardId={boardId}
                  userId={userId}
                  labels={(board.labels ?? []) as Label[]}
                  onClose={() => setShowLabels(false)}
                  onRefetch={refetch}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Kanban columns */}
      <div className="flex gap-3 sm:gap-4 p-3 sm:p-6 overflow-x-auto flex-1 items-start">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {board.columns?.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column as Column & { cards: Card[] }}
                userId={userId}
                boardId={boardId}
                onRefetch={refetch}
                onCardClick={setSelectedCard}
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {activeCard && <KanbanCard card={activeCard} isDragging />}
          </DragOverlay>
        </DndContext>

        <Button
          variant="outline"
          className="shrink-0 w-72 h-10 border-dashed border-[#2A2A2A] text-[#71717A] bg-transparent hover:text-white hover:border-[#3A3A3A] hover:bg-[#111111] gap-2"
          onClick={handleAddColumn}
        >
          <Plus className="w-4 h-4" />
          Add column
        </Button>
      </div>

      {/* Card detail sheet */}
      <CardDetailSheet
        card={selectedCard}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        userId={userId}
        boardLabels={(board.labels ?? []) as Label[]}
        onUpdated={refetch}
      />
    </div>
  )
}
