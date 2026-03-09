import { auth } from "@/lib/auth"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkspaceList } from "@/components/board/workspace-list"

const DashboardPage = async () => {
  const session = await auth()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-semibold">
            Good morning, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-[#71717A] text-sm mt-1">Here are your workspaces</p>
        </div>
        <Button className="bg-indigo-500 hover:bg-indigo-400 text-white gap-2">
          <Plus className="w-4 h-4" />
          New Workspace
        </Button>
      </div>

      <WorkspaceList userId={session?.user?.id ?? ""} />
    </div>
  )
}

export default DashboardPage
