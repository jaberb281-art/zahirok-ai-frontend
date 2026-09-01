import { z } from "zod"

export const CREATOR_TYPES = [
  "Singer / Vocalist",
  "Music Producer",
  "YouTube Music Creator",
  "Studio / Music Business",
  "Songwriter",
  "DJ",
  "Content Creator",
  "Music Listener",
  "Other",
] as const

export const LANGUAGES = [
  "Balochi",
  "Urdu",
  "English",
  "Brahui",
  "Pashto",
  "Sindhi",
  "Punjabi",
  "Other",
] as const

export const INTERESTS = [
  "Full Songs",
  "Vocals",
  "Instrumentals",
  "Remixes",
  "Background Music",
  "Experimental Music",
  "Traditional / Cultural Music",
  "Other",
] as const

export const WORKFLOWS = [
  "Traditional recording",
  "DAW / music software",
  "AI music tools",
  "Recording studio",
  "I don't create music yet",
  "Other",
] as const

const optionalUrlSchema = z
  .string()
  .trim()
  .max(500)
  .optional()
  .refine(
    (value) => {
      if (!value) return true
      try {
        const url = new URL(value.startsWith("http") ? value : `https://${value}`)
        return Boolean(url.hostname)
      } catch {
        return false
      }
    },
    { message: "Enter a valid URL." },
  )

export const earlyAccessSubmissionSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email address.").max(320),
    creatorTypes: z
      .array(z.enum(CREATOR_TYPES))
      .min(1, "Select at least one creator type."),
    languages: z.array(z.enum(LANGUAGES)).min(1, "Select at least one language."),
    interests: z.array(z.enum(INTERESTS)).min(1, "Select at least one interest."),
    currentWorkflow: z.enum(WORKFLOWS, {
      error: "Select how you currently create music.",
    }),
    runsMusicChannel: z.enum(["Yes", "No"]),
    channelUrl: optionalUrlSchema,
    socialUrl: optionalUrlSchema,
  })
  .superRefine((value, ctx) => {
    if (value.runsMusicChannel === "Yes" && value.channelUrl) {
      return
    }
  })

export type EarlyAccessSubmissionInput = z.infer<typeof earlyAccessSubmissionSchema>
