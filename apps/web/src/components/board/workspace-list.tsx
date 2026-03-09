"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Workspace } from "@taskflow/types"
import { WorkspaceCard } from "./workspace-card"
import { Skeleton } from "@/components/ui/skeleton"

type WorkspaceListProps = {
  userId: string
  refreshKey?: number
}

export const WorkspaceList = ({ userId, refreshKey = 0 }: WorkspaceListProps) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get<Workspace[]>("/api/workspaces", { "x-user-id": userId })
      .then(setWorkspaces)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId, refreshKey])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl bg-[#111111]" />
        ))}
      </div>
    )
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#111111] border border-[#1F1F1F] flex items-center justify-center mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <p className="text-white font-medium mb-1">No workspaces yet</p>
        <p className="text-[#71717A] text-sm">Create your first workspace to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {workspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </div>
  )
}
