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

export class MusicGenerationError extends Error {
  readonly code: MusicGenerationErrorCode
  readonly status: number
  readonly retryable: boolean

  constructor(
    code: MusicGenerationErrorCode,
    message: string,
    options?: { status?: number; retryable?: boolean; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined)
    this.name = "MusicGenerationError"
    this.code = code
    this.status = options?.status ?? mapCodeToStatus(code)
    this.retryable = options?.retryable ?? false
  }
}

function mapCodeToStatus(code: MusicGenerationErrorCode): number {
  switch (code) {
    case "INVALID_REQUEST":
      return 400
    case "MISSING_CONFIGURATION":
      return 503
    case "AUTHENTICATION_ERROR":
      return 502
    case "INSUFFICIENT_CREDITS":
      return 402
    case "MODEL_LOADING":
      return 503
    case "MODEL_UNAVAILABLE":
      return 503
    case "RATE_LIMITED":
      return 429
    case "GENERATION_FAILED":
      return 502
    case "INVALID_AUDIO":
      return 502
    case "TIMEOUT":
      return 504
    case "PROVIDER_ERROR":
    case "UNKNOWN":
    default:
      return 502
  }
}

export function toPublicErrorMessage(error: MusicGenerationError): string {
  switch (error.code) {
    case "INVALID_REQUEST":
      return error.message
    case "MISSING_CONFIGURATION":
      return "Music generation is not configured. Add AIMUSICAPI_KEY to the server environment."
    case "AUTHENTICATION_ERROR":
      return "Music provider authentication failed. Check your AI Music API key."
    case "INSUFFICIENT_CREDITS":
      return "Music generation failed because the AI Music API account has insufficient credits."
    case "MODEL_LOADING":
      return "The music model is still warming up. Please try again in a moment."
    case "MODEL_UNAVAILABLE":
      return "The configured music provider is unavailable."
    case "RATE_LIMITED":
      return "Music generation is temporarily rate limited. Please wait and try again."
    case "GENERATION_FAILED":
      return error.message || "Music generation failed on the provider."
    case "TIMEOUT":
      return "Music generation took too long. Please try again."
    case "INVALID_AUDIO":
      return "The provider returned an invalid audio response. Please try again."
    case "PROVIDER_ERROR":
      if (
        error.message.includes("AI Music API") ||
        error.message.includes("AIMUSICAPI")
      ) {
        return error.message
      }
      return "Music generation failed. Please try again."
    case "UNKNOWN":
    default:
      return "Music generation failed. Please try again."
  }
}

export function isMusicGenerationError(error: unknown): error is MusicGenerationError {
  return error instanceof MusicGenerationError
}
