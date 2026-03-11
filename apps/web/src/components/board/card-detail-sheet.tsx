"use client"

import { useEffect, useState, useRef } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { Calendar, Clock, AlignLeft, User, Tag, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Card, ActivityLog, User as UserType } from "@taskflow/types"

type CardAssignee = { user: UserType }
type CardLabel = { label: { id: string; name: string; color: string } }

type CardWithDetails = Omit<Card, "assignees" | "labels"> & {
  assignees: CardAssignee[]
  labels: CardLabel[]
}

type CardDetailSheetProps = {
  card: Card | null
  open: boolean
  onClose: () => void
  userId: string
  onUpdated: () => void
}

const LABEL_COLORS = [
  "#6366F1", "#8B5CF6", "#EC4899", "#EF4444",
  "#F59E0B", "#10B981", "#3B82F6", "#14B8A6",
]

export const CardDetailSheet = ({ card, open, onClose, userId, onUpdated }: CardDetailSheetProps) => {
  const [detail, setDetail] = useState<CardWithDetails | null>(null)
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const titleRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!card || !open) return

    setLoading(true)
    Promise.all([
      api.get<CardWithDetails>(`/api/cards/${card.id}`, { "x-user-id": userId }),
      api.get<ActivityLog[]>(`/api/cards/${card.id}/activity`, { "x-user-id": userId }),
    ])
      .then(([cardData, activityData]) => {
        setDetail(cardData)
        setActivity(activityData)
        setTitle(cardData.title)
        setDescription(cardData.description ?? "")
        setDueDate(cardData.dueDate ? format(new Date(cardData.dueDate), "yyyy-MM-dd") : "")
      })
      .catch(() => toast.error("Failed to load card"))
      .finally(() => setLoading(false))
  }, [card?.id, open])

  const handleSave = async () => {
    if (!card) return
    setSaving(true)
    try {
      await api.patch(
        `/api/cards/${card.id}`,
        {
          title: title.trim() || card.title,
          description: description || null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        },
        { "x-user-id": userId }
      )
      toast.success("Card updated")
      onUpdated()
    } catch {
      toast.error("Failed to update card")
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setDetail(null)
    setActivity([])
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="bg-[#111111] border-l border-[#1F1F1F] w-full sm:max-w-lg overflow-y-auto p-0">
        {loading || !detail ? (
          <div className="p-6 flex flex-col gap-4">
            <Skeleton className="h-8 w-3/4 bg-[#1A1A1A]" />
            <Skeleton className="h-4 w-1/2 bg-[#1A1A1A]" />
            <Skeleton className="h-24 w-full bg-[#1A1A1A]" />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#1F1F1F]">
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                rows={2}
                className="w-full bg-transparent text-white text-xl font-semibold resize-none focus:outline-none placeholder:text-[#3A3A3A] leading-snug"
                placeholder="Card title"
              />
            </SheetHeader>

            {/* Body */}
            <div className="flex-1 px-6 py-4 flex flex-col gap-6">

              {/* Description */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#71717A]">
                  <AlignLeft className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Description</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSave}
                  rows={4}
                  placeholder="Add a description..."
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#3A3A3A] resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#71717A]">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Due date</span>
                </div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  onBlur={handleSave}
                  className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors w-fit [color-scheme:dark]"
                />
              </div>

              {/* Assignees */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#71717A]">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Assignees</span>
                </div>
                {detail.assignees.length === 0 ? (
                  <p className="text-[#3A3A3A] text-sm">No assignees</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {detail.assignees.map(({ user }) => (
                      <div key={user.id} className="flex items-center gap-2 bg-[#1A1A1A] rounded-lg px-3 py-1.5">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={user.image ?? undefined} />
                          <AvatarFallback className="text-[8px] bg-indigo-500 text-white">
                            {user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white text-xs">{user.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Labels */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#71717A]">
                  <Tag className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Labels</span>
                </div>
                {detail.labels.length === 0 ? (
                  <p className="text-[#3A3A3A] text-sm">No labels</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {detail.labels.map(({ label }) => (
                      <span
                        key={label.id}
                        className="flex items-center gap-1.5 text-xs text-white px-2.5 py-1 rounded-full font-medium"
                        style={{ backgroundColor: label.color + "33", color: label.color }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#71717A]">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Activity</span>
                </div>
                {activity.length === 0 ? (
                  <p className="text-[#3A3A3A] text-sm">No activity yet</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {activity.map((log) => (
                      <div key={log.id} className="flex items-start gap-3">
                        <Avatar className="w-6 h-6 shrink-0 mt-0.5">
                          <AvatarImage src={(log.user as any)?.image ?? undefined} />
                          <AvatarFallback className="text-[8px] bg-indigo-500 text-white">
                            {(log.user as any)?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-white text-xs font-medium">{(log.user as any)?.name}</span>
                          <span className="text-[#71717A] text-xs"> {log.action.replace(/_/g, " ")}</span>
                          <p className="text-[#3A3A3A] text-xs mt-0.5">
                            {format(new Date(log.createdAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {saving && (
              <div className="px-6 py-3 border-t border-[#1F1F1F] flex items-center gap-2 text-[#71717A] text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
