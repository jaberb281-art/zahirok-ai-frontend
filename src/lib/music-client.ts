export type MusicGenerationErrorCode =
  | "INVALID_REQUEST"
  | "MISSING_CONFIGURATION"
  | "AUTHENTICATION_ERROR"
  | "INSUFFICIENT_CREDITS"
  | "MODEL_LOADING"
  | "MODEL_UNAVAILABLE"
  | "RATE_LIMITED"
  | "PROVIDER_ERROR"
  | "GENERATION_FAILED"
  | "INVALID_AUDIO"
  | "TIMEOUT"
  | "UNKNOWN"

export interface GenerateMusicRequest {
  prompt: string
  duration?: number
  lyrics?: string
  title?: string
  tags?: string
  instrumental?: boolean
  useCustomLyrics?: boolean
  description?: string
  bpm?: number
  musicKey?: string
  language?: string
  creditsCharged?: number
  signal?: AbortSignal
}

export interface GenerateMusicSuccessResponse {
  success: true
  songId: string
  audioUrl: string
  title: string
  mimeType: string
  duration?: number
}

export interface GenerateMusicErrorResponse {
  success: false
  error: string
  code: MusicGenerationErrorCode
}

export type GenerateMusicResponse =
  | GenerateMusicSuccessResponse
  | GenerateMusicErrorResponse

const PUBLIC_ERROR_MESSAGES: Record<MusicGenerationErrorCode, string> = {
  INVALID_REQUEST: "Enter a valid music prompt before generating.",
  MISSING_CONFIGURATION:
    "Music generation is not configured on the server. Add AIMUSICAPI_KEY to .env.local.",
  AUTHENTICATION_ERROR:
    "Music provider authentication failed. Check your AI Music API key.",
  INSUFFICIENT_CREDITS:
    "Music generation failed because the AI Music API account has insufficient credits.",
  MODEL_LOADING: "The music model is warming up. Please try again shortly.",
  MODEL_UNAVAILABLE: "The configured music provider is unavailable.",
  RATE_LIMITED: "Music generation is temporarily rate limited. Please wait and retry.",
  PROVIDER_ERROR: "Music generation failed. Please try again.",
  GENERATION_FAILED: "Music generation failed on the provider. Please try again.",
  INVALID_AUDIO: "The provider returned invalid audio. Please try again.",
  TIMEOUT: "Music generation took too long. Please try again.",
  UNKNOWN: "Music generation failed. Please try again.",
}

export function getMusicClientErrorMessage(code?: string, fallback?: string): string {
  if (code && code in PUBLIC_ERROR_MESSAGES) {
    return PUBLIC_ERROR_MESSAGES[code as MusicGenerationErrorCode]
  }

  return fallback ?? PUBLIC_ERROR_MESSAGES.UNKNOWN
}

export async function generateMusic(
  request: GenerateMusicRequest,
): Promise<GenerateMusicResponse> {
  const response = await fetch("/api/music/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: request.prompt,
      duration: request.duration,
      lyrics: request.lyrics,
      title: request.title,
      tags: request.tags,
      instrumental: request.instrumental,
      useCustomLyrics: request.useCustomLyrics,
      description: request.description,
      bpm: request.bpm,
      musicKey: request.musicKey,
      language: request.language,
      creditsCharged: request.creditsCharged,
    }),
    signal: request.signal,
    cache: "no-store",
  })

  let payload: GenerateMusicResponse
  try {
    payload = (await response.json()) as GenerateMusicResponse
  } catch {
    return {
      success: false,
      error: PUBLIC_ERROR_MESSAGES.UNKNOWN,
      code: "UNKNOWN",
    }
  }

  if (!payload.success) {
    return {
      success: false,
      error: getMusicClientErrorMessage(payload.code, payload.error),
      code: payload.code ?? "UNKNOWN",
    }
  }

  return payload
}

export function durationOptionToSeconds(
  duration: "30s" | "1min" | "2min" | "4min",
): number | undefined {
  switch (duration) {
    case "30s":
      return 30
    case "1min":
      return 60
    case "2min":
      return 120
    case "4min":
      return 240
    default:
      return undefined
  }
}

export function providerDurationToLabel(duration?: number): string {
  if (duration == null || !Number.isFinite(duration)) {
    return "0:30"
  }

  const totalSeconds = Math.max(0, Math.round(duration))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
