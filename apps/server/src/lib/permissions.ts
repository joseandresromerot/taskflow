import { prisma } from "./prisma"

export async function assertWorkspaceMember(workspaceId: string, userId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  })
  if (!member) throw new Error("Forbidden: Not a workspace member")
  return member
}

export async function assertWorkspaceAdmin(workspaceId: string, userId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  })
  if (!member || member.role !== "ADMIN") throw new Error("Forbidden: Admin role required")
  return member
}
