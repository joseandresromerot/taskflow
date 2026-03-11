import { prisma } from "../../lib/prisma"
import { assertWorkspaceMember } from "../../lib/permissions"
import { CreateCardInput, UpdateCardInput, MoveCardInput, AssignUserInput, AddLabelInput } from "./cards.schema"

const cardIncludes = {
  assignees: { include: { user: true } },
  labels: { include: { label: true } },
}

export async function getCard(id: string, userId: string) {
  const { workspaceId } = await getCardWithWorkspace(id)
  await assertWorkspaceMember(workspaceId, userId)
  return prisma.card.findUnique({ where: { id }, include: cardIncludes })
}

async function getCardWithWorkspace(cardId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { column: { include: { board: true } } },
  })
  if (!card) throw new Error("Card not found")
  return { card, workspaceId: card.column.board.workspaceId }
}

async function getColumnWorkspaceId(columnId: string) {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { board: true },
  })
  if (!column) throw new Error("Column not found")
  return column.board.workspaceId
}

export async function createCard(data: CreateCardInput, userId: string) {
  const workspaceId = await getColumnWorkspaceId(data.columnId)
  await assertWorkspaceMember(workspaceId, userId)

  const lastCard = await prisma.card.findFirst({
    where: { columnId: data.columnId },
    orderBy: { position: "desc" },
  })

  const card = await prisma.card.create({
    data: { title: data.title, columnId: data.columnId, position: (lastCard?.position ?? -1) + 1 },
    include: cardIncludes,
  })

  await prisma.activityLog.create({
    data: { action: "card_created", userId, cardId: card.id, metadata: { title: card.title } },
  })

  return card
}

export async function updateCard(id: string, data: UpdateCardInput, userId: string) {
  const { workspaceId } = await getCardWithWorkspace(id)
  await assertWorkspaceMember(workspaceId, userId)

  const card = await prisma.card.update({
    where: { id },
    data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate },
    include: cardIncludes,
  })

  await prisma.activityLog.create({
    data: { action: "card_updated", userId, cardId: id },
  })

  return card
}

export async function moveCard(id: string, data: MoveCardInput, userId: string) {
  const { workspaceId } = await getCardWithWorkspace(id)
  await assertWorkspaceMember(workspaceId, userId)

  // Shift positions of other cards in the target column
  await prisma.card.updateMany({
    where: { columnId: data.columnId, position: { gte: data.position }, id: { not: id } },
    data: { position: { increment: 1 } },
  })

  const card = await prisma.card.update({
    where: { id },
    data: { columnId: data.columnId, position: data.position },
    include: cardIncludes,
  })

  await prisma.activityLog.create({
    data: { action: "card_moved", userId, cardId: id },
  })

  return card
}

export async function deleteCard(id: string, userId: string) {
  const { workspaceId } = await getCardWithWorkspace(id)
  await assertWorkspaceMember(workspaceId, userId)
  return prisma.card.delete({ where: { id } })
}

export async function assignUser(cardId: string, data: AssignUserInput, userId: string) {
  const { workspaceId } = await getCardWithWorkspace(cardId)
  await assertWorkspaceMember(workspaceId, userId)

  await prisma.cardAssignee.upsert({
    where: { cardId_userId: { cardId, userId: data.userId } },
    create: { cardId, userId: data.userId },
    update: {},
  })

  await prisma.activityLog.create({
    data: { action: "card_assigned", userId, cardId, metadata: { assignedUserId: data.userId } },
  })
}

export async function unassignUser(cardId: string, assigneeId: string, userId: string) {
  const { workspaceId } = await getCardWithWorkspace(cardId)
  await assertWorkspaceMember(workspaceId, userId)
  return prisma.cardAssignee.delete({ where: { cardId_userId: { cardId, userId: assigneeId } } })
}

export async function addLabel(cardId: string, data: AddLabelInput, userId: string) {
  const { workspaceId } = await getCardWithWorkspace(cardId)
  await assertWorkspaceMember(workspaceId, userId)

  return prisma.cardLabel.upsert({
    where: { cardId_labelId: { cardId, labelId: data.labelId } },
    create: { cardId, labelId: data.labelId },
    update: {},
  })
}

export async function removeLabel(cardId: string, labelId: string, userId: string) {
  const { workspaceId } = await getCardWithWorkspace(cardId)
  await assertWorkspaceMember(workspaceId, userId)
  return prisma.cardLabel.delete({ where: { cardId_labelId: { cardId, labelId } } })
}

export async function getCardActivity(cardId: string, userId: string) {
  const { workspaceId } = await getCardWithWorkspace(cardId)
  await assertWorkspaceMember(workspaceId, userId)

  return prisma.activityLog.findMany({
    where: { cardId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  })
}
