"use client"

import Link from "next/link"
import { LayoutGrid, Users } from "lucide-react"
import { Workspace } from "@taskflow/types"
import { Badge } from "@/components/ui/badge"

type WorkspaceCardProps = {
  workspace: Workspace & { _count?: { boards: number } }
}

export const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
  return (
    <Link href={`/dashboard/${workspace.id}`}>
      <div className="group bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 hover:border-indigo-500/50 hover:bg-[#141414] transition-all cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <span className="text-indigo-400 font-bold text-sm">
              {workspace.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-xs border-[#2A2A2A] text-[#71717A] bg-transparent"
          >
            {workspace.slug}
          </Badge>
        </div>

        {/* Name */}
        <h3 className="text-white font-medium mb-1 group-hover:text-indigo-300 transition-colors">
          {workspace.name}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-[#71717A] text-xs">
          <span className="flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5" />
            {workspace._count?.boards ?? 0} boards
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {workspace.members?.length ?? 0} members
          </span>
        </div>
      </div>
    </Link>
  )
}
