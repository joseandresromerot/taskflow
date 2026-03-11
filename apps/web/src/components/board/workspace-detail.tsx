"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Plus, LayoutGrid, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { Board, Workspace } from "@taskflow/types"

type WorkspaceDetailProps = {
  workspaceId: string
  userId: string
}

type WorkspaceWithBoards = Workspace & { boards: Board[] }

export const WorkspaceDetail = ({ workspaceId, userId }: WorkspaceDetailProps) => {
  const router = useRouter()
  const [workspace, setWorkspace] = useState<WorkspaceWithBoards | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const fetchWorkspace = () => {
    setLoading(true)
    api
      .get<WorkspaceWithBoards>(`/api/workspaces/${workspaceId}`, { "x-user-id": userId })
      .then(setWorkspace)
      .catch(() => toast.error("Failed to load workspace"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchWorkspace() }, [workspaceId, userId])

  const handleCreateBoard = async () => {
    setCreating(true)
    try {
      const board = await api.post<Board>(
        "/api/boards",
        { name: "New Board", workspaceId },
        { "x-user-id": userId }
      )
      router.push(`/board/${board.id}`)
    } catch {
      toast.error("Failed to create board")
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-48 mb-2 bg-[#111111]" />
        <Skeleton className="h-4 w-32 mb-8 bg-[#111111]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl bg-[#111111]" />
          ))}
        </div>
      </div>
    )
  }

  if (!workspace) return null

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-[#71717A] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white text-2xl font-semibold">{workspace.name}</h1>
            <p className="text-[#71717A] text-sm mt-0.5">
              {workspace.boards.length} board{workspace.boards.length !== 1 ? "s" : ""} · {workspace.members?.length ?? 0} members
            </p>
          </div>
        </div>

        <Button
          className="bg-indigo-500 hover:bg-indigo-400 text-white gap-2"
          onClick={handleCreateBoard}
          disabled={creating}
        >
          <Plus className="w-4 h-4" />
          New Board
        </Button>
      </div>

      {/* Boards grid */}
      {workspace.boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#111111] border border-[#1F1F1F] flex items-center justify-center mb-4">
            <LayoutGrid className="w-5 h-5 text-[#71717A]" />
          </div>
          <p className="text-white font-medium mb-1">No boards yet</p>
          <p className="text-[#71717A] text-sm mb-4">Create your first board to get started</p>
          <Button
            className="bg-indigo-500 hover:bg-indigo-400 text-white gap-2"
            onClick={handleCreateBoard}
            disabled={creating}
          >
            <Plus className="w-4 h-4" />
            Create board
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspace.boards.map((board) => (
            <button
              key={board.id}
              onClick={() => router.push(`/board/${board.id}`)}
              className="group bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 text-left hover:border-indigo-500/50 hover:bg-[#141414] transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                <LayoutGrid className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-white font-medium group-hover:text-indigo-300 transition-colors">
                {board.name}
              </h3>
              {board.description && (
                <p className="text-[#71717A] text-sm mt-1 line-clamp-2">{board.description}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
