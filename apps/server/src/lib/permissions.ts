import { prisma } from "./prisma"
import { HttpError } from "./errors"

export async function assertWorkspaceMember(workspaceId: string, userId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  })
  if (!member) throw new HttpError(403, "Forbidden")
  return member
}

export async function assertWorkspaceAdmin(workspaceId: string, userId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  })
  if (!member || member.role !== "ADMIN") throw new HttpError(403, "Forbidden")
  return member
}
