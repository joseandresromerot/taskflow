"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateWorkspaceModal } from "./create-workspace-modal"

type DashboardHeaderProps = {
  name: string
  userId: string
  onCreated: () => void
}

export const DashboardHeader = ({ name, userId, onCreated }: DashboardHeaderProps) => {
  const [open, setOpen] = useState(false)

  const handleCreated = () => {
    setOpen(false)
    onCreated()
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-white text-xl sm:text-2xl font-semibold">
            Good morning, {name} 👋
          </h1>
          <p className="text-[#71717A] text-sm mt-1">Here are your workspaces</p>
        </div>
        <Button
          className="bg-indigo-500 hover:bg-indigo-400 text-white gap-2 w-full sm:w-auto"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4" />
          New Workspace
        </Button>
      </div>

      <CreateWorkspaceModal open={open} onClose={() => setOpen(false)} onCreated={handleCreated} userId={userId} />
    </>
  )
}
