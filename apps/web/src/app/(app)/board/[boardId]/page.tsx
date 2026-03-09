import { auth } from "@/lib/auth"
import { KanbanBoard } from "@/components/board/kanban-board"

type BoardPageProps = {
  params: Promise<{ boardId: string }>
}

const BoardPage = async ({ params }: BoardPageProps) => {
  const [session, { boardId }] = await Promise.all([auth(), params])

  return (
    <KanbanBoard boardId={boardId} userId={session?.user?.id ?? ""} />
  )
}

export default BoardPage
