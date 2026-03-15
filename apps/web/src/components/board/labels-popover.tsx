"use client"

import { useState, useRef, useEffect } from "react"
import { X, Plus, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { toast } from "sonner"
import type { Label } from "@taskflow/types"

const LABEL_COLORS = [
  "#6366F1", "#8B5CF6", "#EC4899", "#EF4444",
  "#F59E0B", "#10B981", "#3B82F6", "#14B8A6",
]

type LabelsPopoverProps = {
  boardId: string
  userId: string
  labels: Label[]
  onClose: () => void
  onRefetch: () => void
}

export const LabelsPopover = ({ boardId, userId, labels, onClose, onRefetch }: LabelsPopoverProps) => {
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(LABEL_COLORS[0])
  const [creating, setCreating] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await api.post("/api/labels", { name: newName.trim(), color: newColor, boardId }, { "x-user-id": userId })
      setNewName("")
      setNewColor(LABEL_COLORS[0])
      onRefetch()
    } catch {
      toast.error("Failed to create label")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (labelId: string) => {
    try {
      await api.delete(`/api/labels/${labelId}`, { "x-user-id": userId })
      onRefetch()
    } catch {
      toast.error("Failed to delete label")
    }
  }

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-2 z-50 w-72 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 shadow-xl flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-medium">Labels</span>
        <button onClick={onClose} className="text-[#71717A] hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Existing labels */}
      <div className="flex flex-col gap-2">
        {labels.length === 0 ? (
          <p className="text-[#3A3A3A] text-xs">No labels yet</p>
        ) : (
          labels.map((label) => (
            <div key={label.id} className="flex items-center gap-2">
              <span
                className="flex-1 flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg font-medium"
                style={{ backgroundColor: label.color + "22", color: label.color }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                {label.name}
              </span>
              <button
                onClick={() => handleDelete(label.id)}
                className="text-[#71717A] hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Create new label */}
      <div className="flex flex-col gap-3 pt-3 border-t border-[#2A2A2A]">
        <span className="text-[#71717A] text-xs font-medium uppercase tracking-wide">New label</span>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }}
          placeholder="Label name..."
          className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#3A3A3A] focus:outline-none focus:border-indigo-500"
        />
        <div className="flex gap-2 flex-wrap">
          {LABEL_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setNewColor(color)}
              className="w-6 h-6 rounded-full transition-transform hover:scale-110 relative flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              {newColor === color && <Check className="w-3 h-3 text-white" />}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          disabled={!newName.trim() || creating}
          onClick={handleCreate}
          className="bg-indigo-500 hover:bg-indigo-400 text-white w-full gap-2 h-8"
        >
          <Plus className="w-3.5 h-3.5" />
          Add label
        </Button>
      </div>
    </div>
  )
}
