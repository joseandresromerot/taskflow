import { z } from "zod"

export const createCardSchema = z.object({
  title: z.string().min(1).max(255),
  columnId: z.string().cuid(),
})

export const updateCardSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  dueDate: z.string().datetime().optional().nullable(),
})

export const moveCardSchema = z.object({
  columnId: z.string().cuid(),
  position: z.number().int().min(0),
  boardId: z.string().cuid(),
})

export const assignUserSchema = z.object({
  userId: z.string().cuid(),
})

export const addLabelSchema = z.object({
  labelId: z.string().cuid(),
})

export type CreateCardInput = z.infer<typeof createCardSchema>
export type UpdateCardInput = z.infer<typeof updateCardSchema>
export type MoveCardInput = z.infer<typeof moveCardSchema>
export type AssignUserInput = z.infer<typeof assignUserSchema>
export type AddLabelInput = z.infer<typeof addLabelSchema>
