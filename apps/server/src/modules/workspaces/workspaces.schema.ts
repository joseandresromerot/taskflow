import { z } from "zod"

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens"),
})

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(50).optional(),
})

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
})

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
})

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>
