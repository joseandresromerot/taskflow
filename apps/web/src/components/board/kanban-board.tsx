"use client"

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { useBoard } from "@/hooks/use-board"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { api } from "@/lib/api"
import { Column, Card } from "@taskflow/types"

type KanbanBoardProps = {
  boardId: string
  userId: string
}

export const KanbanBoard = ({ boardId, userId }: KanbanBoardProps) => {
  const { board, loading, refetch } = useBoard(boardId, userId)
  const [activeCard, setActiveCard] = useState<Card | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleAddColumn = async () => {
    await api.post("/api/columns", { boardId, name: "New Column" }, { "x-user-id": userId })
    refetch()
  }

  const handleDragStart = ({ active }: DragStartEvent) => {
    const card = board?.columns
      ?.flatMap((col) => col.cards ?? [])
      .find((c) => c.id === active.id)
    setActiveCard(card ?? null)
  }

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveCard(null)
    if (!over || active.id === over.id || !board) return

    const sourceCol = board.columns?.find((col) =>
      col.cards?.some((c) => c.id === active.id)
    )
    const targetCol = board.columns?.find(
      (col) => col.id === over.id || col.cards?.some((c) => c.id === over.id)
    )

    if (!sourceCol || !targetCol) return

    const targetCards = targetCol.cards ?? []
    const overIndex = targetCards.findIndex((c) => c.id === over.id)
    const position = overIndex === -1 ? targetCards.length : overIndex

    await api.post(
      `/api/cards/${active.id}/move`,
      { columnId: targetCol.id, position, boardId },
      { "x-user-id": userId }
    )
    refetch()
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
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F1F1F]">
        <h1 className="text-white text-lg font-semibold">{board.name}</h1>
      </div>

      {/* Kanban columns */}
      <div className="flex gap-4 p-6 overflow-x-auto flex-1 items-start">
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
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {activeCard && <KanbanCard card={activeCard} isDragging />}
          </DragOverlay>
        </DndContext>

        {/* Add column button */}
        <Button
          variant="outline"
          className="shrink-0 w-72 h-10 border-dashed border-[#2A2A2A] text-[#71717A] bg-transparent hover:text-white hover:border-[#3A3A3A] hover:bg-[#111111] gap-2"
          onClick={handleAddColumn}
        >
          <Plus className="w-4 h-4" />
          Add column
        </Button>
      </div>
    </div>
  )
}
