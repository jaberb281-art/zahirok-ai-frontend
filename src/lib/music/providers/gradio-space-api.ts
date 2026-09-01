/**
 * Gradio API surface discovered via `@gradio/client` `view_api()` against
 * `facebook/MusicGen` on 2026-08-31.
 *
 * Space identifier: `facebook/MusicGen`
 * Public URL: https://facebook-musicgen.hf.space
 */
export const DEFAULT_MUSICGEN_SPACE = "facebook/MusicGen"

/** Named Gradio endpoint exposed by the public MusicGen demo Space. */
export const MUSICGEN_GRADIO_API_NAME = "/predict_batched"

/** Public demo generates ~15 seconds (hard-coded in Space source as BATCHED_DURATION). */
export const MUSICGEN_PUBLIC_DEMO_DURATION_SECONDS = 15

export const MUSICGEN_GRADIO_INPUTS = [
  {
    order: 1,
    parameterName: "texts",
    label: "Describe your music",
    required: true,
    component: "Textbox",
    type: "string",
    pythonType: "str",
  },
  {
    order: 2,
    parameterName: "melodies",
    label: "Condition on a melody (optional)",
    required: true,
    component: "Audio",
    type: "FileData",
    pythonType: "filepath",
    optionalInUi: true,
  },
] as const

export const MUSICGEN_GRADIO_OUTPUT = {
  label: "Generated Music",
  component: "Audio",
  pythonType: "filepath",
  type: "FileData",
} as const

export interface GradioFileData {
  path: string
  url?: string | null
  size?: number | null
  orig_name?: string | null
  mime_type?: string | null
  is_stream?: boolean
  meta?: { _type: string }
}

export interface MusicGenGradioPredictInput {
  texts: string
  melodies: GradioFileData | null
}

export interface GradioPredictStatusError extends Error {
  title?: string
  stage?: string
  endpoint?: string
  original_msg?: string
  success?: boolean
}
