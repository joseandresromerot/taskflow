import { auth } from "@/lib/auth"
import { WorkspaceDetail } from "@/components/board/workspace-detail"

type WorkspacePageProps = {
  params: Promise<{ workspaceId: string }>
}

const WorkspacePage = async ({ params }: WorkspacePageProps) => {
  const [session, { workspaceId }] = await Promise.all([auth(), params])

  return (
    <WorkspaceDetail workspaceId={workspaceId} userId={session?.user?.id ?? ""} />
  )
}

export default WorkspacePage
