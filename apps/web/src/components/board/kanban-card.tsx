"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Calendar, User } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Card } from "@taskflow/types"

type KanbanCardProps = {
  card: Card
  isDragging?: boolean
}

export const KanbanCard = ({ card, isDragging = false }: KanbanCardProps) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: card.id, data: { type: "card" } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isHidden = isSortableDragging && !isDragging

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-[#3A3A3A] transition-colors select-none",
        isHidden && "opacity-0",
        isDragging && "shadow-2xl shadow-black/50 rotate-1"
      )}
    >
      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((cl: any) => (
            <span
              key={cl.label?.id ?? cl.labelId}
              className="h-1.5 w-8 rounded-full"
              style={{ backgroundColor: cl.label?.color ?? "#6366F1" }}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-white text-sm leading-snug">{card.title}</p>

      {/* Footer */}
      {(card.dueDate || (card.assignees && card.assignees.length > 0)) && (
        <div className="flex items-center justify-between mt-3">
          {card.dueDate && (
            <span className="flex items-center gap-1 text-[#71717A] text-xs">
              <Calendar className="w-3 h-3" />
              {format(new Date(card.dueDate), "MMM d")}
            </span>
          )}

          {card.assignees && card.assignees.length > 0 && (
            <div className="flex -space-x-1.5 ml-auto">
              {card.assignees.slice(0, 3).map((assignee: any) => {
                const user = assignee.user ?? assignee
                return (
                  <Avatar key={user.id} className="w-5 h-5 border border-[#1A1A1A]">
                    <AvatarImage src={user.avatar ?? undefined} />
                    <AvatarFallback className="text-[8px] bg-indigo-500 text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
