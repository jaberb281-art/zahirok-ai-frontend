import { z } from "zod"

export const uuidParamSchema = z.string().uuid()

export const patchSongSchema = z
  .object({
    title: z.string().trim().min(1).max(80).optional(),
    description: z.string().trim().max(500).optional(),
    visibility: z.enum(["private", "public"]).optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.description !== undefined ||
      value.visibility !== undefined,
    { message: "At least one field must be provided." },
  )
