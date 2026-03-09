"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

type CreateWorkspaceModalProps = {
  open: boolean
  onClose: () => void
  onCreated: () => void
  userId: string
}

const toSlug = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

export const CreateWorkspaceModal = ({ open, onClose, onCreated, userId }: CreateWorkspaceModalProps) => {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [loading, setLoading] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    setSlug(toSlug(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return

    setLoading(true)
    try {
      await api.post("/api/workspaces", { name, slug }, { "x-user-id": userId })
      toast.success("Workspace created!")
      setName("")
      setSlug("")
      onCreated()
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create workspace")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName("")
    setSlug("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#111111] border-[#1F1F1F] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create workspace</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[#71717A] text-xs">Name</Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Workspace"
              className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#3A3A3A] focus-visible:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[#71717A] text-xs">Slug</Label>
            <div className="flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md px-3">
              <span className="text-[#71717A] text-sm shrink-0">taskflow.io/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(toSlug(e.target.value))}
                placeholder="my-workspace"
                className="flex-1 bg-transparent text-white text-sm py-2 focus:outline-none placeholder:text-[#3A3A3A]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="ghost"
              className="text-[#71717A] hover:text-white"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim() || !slug.trim()}
              className="bg-indigo-500 hover:bg-indigo-400 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
