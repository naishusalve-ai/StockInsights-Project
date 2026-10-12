import { z } from "zod"

export const createPortfolioSchema = z.object({
  symbol: z.string().min(1),
  quantity: z.number().int().positive(),
  avgPrice: z.number().positive(),
})

export const updatePortfolioSchema = z.object({
  symbol: z.string().min(1).optional(),
  quantity: z.number().int().positive().optional(),
  avgPrice: z.number().positive().optional(),
  currentPrice: z.number().positive().nullable().optional(),
})

export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>
