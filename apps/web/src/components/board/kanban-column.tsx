"use client"

import { useState, useRef, useEffect } from "react"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { KanbanCard } from "./kanban-card"
import { api } from "@/lib/api"
import { Column, Card } from "@taskflow/types"
import { toast } from "sonner"

type KanbanColumnProps = {
  column: Column & { cards: Card[] }
  userId: string
  boardId: string
  onRefetch: () => void
  onCardClick: (card: Card) => void
}

export const KanbanColumn = ({ column, userId, boardId, onRefetch, onCardClick }: KanbanColumnProps) => {
  const [addingCard, setAddingCard] = useState(false)
  const [cardTitle, setCardTitle] = useState("")
  const [renaming, setRenaming] = useState(false)
  const [columnName, setColumnName] = useState(column.name)
  const renameRef = useRef<HTMLInputElement>(null)

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: "column" },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  useEffect(() => {
    if (renaming) renameRef.current?.focus()
  }, [renaming])

  const handleAddCard = async () => {
    if (!cardTitle.trim()) return
    await api.post("/api/cards", { columnId: column.id, title: cardTitle }, { "x-user-id": userId })
    setCardTitle("")
    setAddingCard(false)
    onRefetch()
  }

  const handleRename = async () => {
    const name = columnName.trim()
    setRenaming(false)
    if (!name || name === column.name) {
      setColumnName(column.name)
      return
    }
    try {
      await api.patch(`/api/columns/${column.id}`, { name }, { "x-user-id": userId })
      onRefetch()
    } catch {
      toast.error("Failed to rename column")
      setColumnName(column.name)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/api/columns/${column.id}`, { "x-user-id": userId })
      onRefetch()
    } catch {
      toast.error("Failed to delete column")
    }
  }

  const cardIds = column.cards.map((c) => c.id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="shrink-0 w-64 sm:w-72 flex flex-col bg-[#111111] border border-[#1F1F1F] rounded-xl"
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div
          className="flex items-center gap-2 flex-1 cursor-grab active:cursor-grabbing min-w-0"
          {...attributes}
          {...listeners}
        >
          {renaming ? (
            <input
              ref={renameRef}
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename()
                if (e.key === "Escape") { setRenaming(false); setColumnName(column.name) }
              }}
              className="bg-transparent text-white text-sm font-medium focus:outline-none border-b border-indigo-500 w-full"
            />
          ) : (
            <span className="text-white text-sm font-medium truncate">{columnName}</span>
          )}
          <span className="text-xs text-[#71717A] bg-[#1A1A1A] px-1.5 py-0.5 rounded-md shrink-0">
            {column.cards.length}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-[#71717A] hover:text-white shrink-0"
              />
            }
          >
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-[#1A1A1A] border border-[#2A2A2A] min-w-36"
            align="end"
          >
            <DropdownMenuItem
              className="text-white hover:bg-[#2A2A2A] gap-2 cursor-pointer"
              onClick={() => setRenaming(true)}
            >
              <Pencil className="w-3.5 h-3.5 text-[#71717A]" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#2A2A2A]" />
            <DropdownMenuItem
              variant="destructive"
              className="gap-2 cursor-pointer"
              onClick={handleDelete}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 px-2 pb-2 flex-1 min-h-[2rem]">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <KanbanCard key={card.id} card={card} onClick={onCardClick} />
          ))}
        </SortableContext>
      </div>

      {/* Add card */}
      <div className="px-2 pb-2">
        {addingCard ? (
          <div className="flex flex-col gap-2">
            <textarea
              autoFocus
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddCard() }
                if (e.key === "Escape") { setAddingCard(false); setCardTitle("") }
              }}
              placeholder="Card title..."
              rows={2}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#71717A] resize-none focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-indigo-500 hover:bg-indigo-400 text-white text-xs h-7"
                onClick={handleAddCard}
              >
                Add card
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-[#71717A] hover:text-white text-xs h-7"
                onClick={() => { setAddingCard(false); setCardTitle("") }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-[#71717A] hover:text-white hover:bg-[#1A1A1A] text-xs h-8"
            onClick={() => setAddingCard(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add card
          </Button>
        )}
      </div>
    </div>
  )
}
