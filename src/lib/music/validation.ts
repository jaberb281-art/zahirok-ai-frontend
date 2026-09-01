import { z } from "zod"

export const PROMPT_MAX_LENGTH = 500
export const LYRICS_MAX_LENGTH = 5000
export const TITLE_MAX_LENGTH = 80
export const TAGS_MAX_LENGTH = 1000
/** AI Music API gpt_description_prompt limit */
export const GPT_DESCRIPTION_MAX_LENGTH = 400
export const DURATION_MIN_SECONDS = 10
export const DURATION_MAX_SECONDS = 360

export const generateMusicRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "Prompt is required")
    .max(PROMPT_MAX_LENGTH, `Prompt must be ${PROMPT_MAX_LENGTH} characters or fewer`),
  duration: z
    .number()
    .int()
    .min(DURATION_MIN_SECONDS)
    .max(DURATION_MAX_SECONDS)
    .optional(),
  lyrics: z
    .string()
    .trim()
    .max(LYRICS_MAX_LENGTH, `Lyrics must be ${LYRICS_MAX_LENGTH} characters or fewer`)
    .optional(),
  title: z
    .string()
    .trim()
    .max(TITLE_MAX_LENGTH, `Title must be ${TITLE_MAX_LENGTH} characters or fewer`)
    .optional(),
  tags: z
    .string()
    .trim()
    .max(TAGS_MAX_LENGTH, `Tags must be ${TAGS_MAX_LENGTH} characters or fewer`)
    .optional(),
  instrumental: z.boolean().optional(),
  useCustomLyrics: z.boolean().optional(),
  description: z.string().trim().max(500).optional(),
  bpm: z.number().int().min(20).max(300).optional(),
  musicKey: z.string().trim().max(32).optional(),
  language: z.string().trim().max(32).optional(),
  creditsCharged: z.number().int().min(0).optional(),
})

export type GenerateMusicRequestBody = z.infer<typeof generateMusicRequestSchema>
