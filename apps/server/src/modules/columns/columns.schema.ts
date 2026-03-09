import { z } from "zod"

export const createColumnSchema = z.object({
  name: z.string().min(1).max(100),
  boardId: z.string().cuid(),
})

export const updateColumnSchema = z.object({
  name: z.string().min(1).max(100).optional(),
})

export const reorderColumnsSchema = z.object({
  columnIds: z.array(z.string().cuid()),
})

export type CreateColumnInput = z.infer<typeof createColumnSchema>
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>
