import { z } from "zod"

export const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  workspaceId: z.string().cuid(),
})

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
})

export type CreateBoardInput = z.infer<typeof createBoardSchema>
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>
