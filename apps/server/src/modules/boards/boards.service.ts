import { prisma } from "../../lib/prisma"
import { assertWorkspaceMember, assertWorkspaceAdmin } from "../../lib/permissions"
import { CreateBoardInput, UpdateBoardInput } from "./boards.schema"

export async function getBoards(workspaceId: string, userId: string) {
  await assertWorkspaceMember(workspaceId, userId)
  return prisma.board.findMany({
    where: { workspaceId },
    include: { _count: { select: { columns: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function getBoard(id: string, userId: string) {
  const board = await prisma.board.findUnique({
    where: { id },
    include: {
      labels: true,
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
            include: {
              assignees: { include: { user: true } },
              labels: { include: { label: true } },
            },
          },
        },
      },
    },
  })
  if (!board) return null
  await assertWorkspaceMember(board.workspaceId, userId)
  return board
}

export async function createBoard(data: CreateBoardInput, userId: string) {
  await assertWorkspaceMember(data.workspaceId, userId)
  return prisma.board.create({
    data: { name: data.name, description: data.description, workspaceId: data.workspaceId },
  })
}

export async function updateBoard(id: string, data: UpdateBoardInput, userId: string) {
  const board = await prisma.board.findUnique({ where: { id } })
  if (!board) throw new Error("Board not found")
  await assertWorkspaceMember(board.workspaceId, userId)
  return prisma.board.update({ where: { id }, data })
}

export async function deleteBoard(id: string, userId: string) {
  const board = await prisma.board.findUnique({ where: { id } })
  if (!board) throw new Error("Board not found")
  await assertWorkspaceAdmin(board.workspaceId, userId)
  return prisma.board.delete({ where: { id } })
}
