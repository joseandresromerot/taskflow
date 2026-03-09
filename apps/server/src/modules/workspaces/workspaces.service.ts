import { prisma } from "../../lib/prisma"
import { assertWorkspaceAdmin } from "../../lib/permissions"
import {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
} from "./workspaces.schema"

export async function getWorkspaces(userId: string) {
  return prisma.workspace.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      members: { include: { user: true } },
      _count: { select: { boards: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getWorkspace(id: string, userId: string) {
  return prisma.workspace.findFirst({
    where: {
      id,
      members: { some: { userId } },
    },
    include: {
      members: { include: { user: true } },
      boards: { orderBy: { createdAt: "desc" } },
    },
  })
}

export async function createWorkspace(data: CreateWorkspaceInput, userId: string) {
  return prisma.workspace.create({
    data: {
      name: data.name,
      slug: data.slug,
      members: {
        create: { userId, role: "ADMIN" },
      },
    },
    include: {
      members: { include: { user: true } },
    },
  })
}

export async function updateWorkspace(id: string, data: UpdateWorkspaceInput, userId: string) {
  await assertWorkspaceAdmin(id, userId)
  return prisma.workspace.update({
    where: { id },
    data,
  })
}

export async function deleteWorkspace(id: string, userId: string) {
  await assertWorkspaceAdmin(id, userId)
  return prisma.workspace.delete({ where: { id } })
}

export async function inviteMember(id: string, data: InviteMemberInput, userId: string) {
  await assertWorkspaceAdmin(id, userId)

  const invitedUser = await prisma.user.findUnique({ where: { email: data.email } })
  if (!invitedUser) throw new Error("User not found")

  const existing = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: invitedUser.id, workspaceId: id } },
  })
  if (existing) throw new Error("User is already a member")

  return prisma.workspaceMember.create({
    data: { userId: invitedUser.id, workspaceId: id, role: data.role },
    include: { user: true },
  })
}

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  data: UpdateMemberRoleInput,
  userId: string
) {
  await assertWorkspaceAdmin(workspaceId, userId)
  return prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role: data.role },
    include: { user: true },
  })
}

export async function removeMember(workspaceId: string, memberId: string, userId: string) {
  await assertWorkspaceAdmin(workspaceId, userId)
  return prisma.workspaceMember.delete({ where: { id: memberId } })
}