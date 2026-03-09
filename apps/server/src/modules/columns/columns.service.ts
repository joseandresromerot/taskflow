import { prisma } from "../../lib/prisma"
import { assertWorkspaceMember } from "../../lib/permissions"
import { CreateColumnInput, UpdateColumnInput, ReorderColumnsInput } from "./columns.schema"

async function getBoardWorkspaceId(boardId: string) {
  const board = await prisma.board.findUnique({ where: { id: boardId }, select: { workspaceId: true } })
  if (!board) throw new Error("Board not found")
  return board.workspaceId
}

export async function createColumn(data: CreateColumnInput, userId: string) {
  const workspaceId = await getBoardWorkspaceId(data.boardId)
  await assertWorkspaceMember(workspaceId, userId)

  const lastColumn = await prisma.column.findFirst({
    where: { boardId: data.boardId },
    orderBy: { position: "desc" },
  })

  return prisma.column.create({
    data: { name: data.name, boardId: data.boardId, position: (lastColumn?.position ?? -1) + 1 },
  })
}

export async function updateColumn(id: string, data: UpdateColumnInput, userId: string) {
  const column = await prisma.column.findUnique({ where: { id }, include: { board: true } })
  if (!column) throw new Error("Column not found")
  await assertWorkspaceMember(column.board.workspaceId, userId)
  return prisma.column.update({ where: { id }, data })
}

export async function deleteColumn(id: string, userId: string) {
  const column = await prisma.column.findUnique({ where: { id }, include: { board: true } })
  if (!column) throw new Error("Column not found")
  await assertWorkspaceMember(column.board.workspaceId, userId)
  return prisma.column.delete({ where: { id } })
}

export async function reorderColumns(boardId: string, data: ReorderColumnsInput, userId: string) {
  const workspaceId = await getBoardWorkspaceId(boardId)
  await assertWorkspaceMember(workspaceId, userId)

  // Update each column position in a transaction
  await prisma.$transaction(
    data.columnIds.map((columnId, index) =>
      prisma.column.update({ where: { id: columnId }, data: { position: index } })
    )
  )
}
