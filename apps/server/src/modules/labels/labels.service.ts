import { prisma } from "../../lib/prisma"
import { assertWorkspaceMember } from "../../lib/permissions"
import { HttpError } from "../../lib/errors"
import { CreateLabelInput, UpdateLabelInput } from "./labels.schema"

async function getLabelWithWorkspace(id: string) {
  const label = await prisma.label.findUnique({ where: { id }, include: { board: true } })
  if (!label) throw new HttpError(404, "Label not found")
  return label
}

export async function createLabel(data: CreateLabelInput, userId: string) {
  const board = await prisma.board.findUnique({ where: { id: data.boardId }, select: { workspaceId: true } })
  if (!board) throw new HttpError(404, "Board not found")
  await assertWorkspaceMember(board.workspaceId, userId)
  return prisma.label.create({ data: { name: data.name, color: data.color, boardId: data.boardId } })
}

export async function updateLabel(id: string, data: UpdateLabelInput, userId: string) {
  const label = await getLabelWithWorkspace(id)
  await assertWorkspaceMember(label.board.workspaceId, userId)
  return prisma.label.update({ where: { id }, data })
}

export async function deleteLabel(id: string, userId: string) {
  const label = await getLabelWithWorkspace(id)
  await assertWorkspaceMember(label.board.workspaceId, userId)
  return prisma.label.delete({ where: { id } })
}
