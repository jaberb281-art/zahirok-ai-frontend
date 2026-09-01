import { Client } from "@gradio/client"

import {
  MusicGenerationError,
  type MusicGenerationErrorCode,
} from "@/lib/music/errors"
import type {
  MusicGenerationInput,
  MusicGenerationResult,
  MusicProvider,
} from "@/lib/music/types"
import {
  DEFAULT_MUSICGEN_SPACE,
  type GradioFileData,
  type GradioPredictStatusError,
  MUSICGEN_GRADIO_API_NAME,
  MUSICGEN_PUBLIC_DEMO_DURATION_SECONDS,
  type MusicGenGradioPredictInput,
} from "@/lib/music/providers/gradio-space-api"

const SPACE_TIMEOUT_MS = 180_000
const REQUEST_TIMEOUT_MS = 60_000

function getRequiredHuggingFaceToken(): `hf_${string}` {
  const token = process.env.HF_TOKEN?.trim()
  if (!token) {
    throw new MusicGenerationError(
      "MISSING_CONFIGURATION",
      "HF_TOKEN is not configured on the server.",
    )
  }

  if (!token.startsWith("hf_")) {
    throw new MusicGenerationError(
      "AUTHENTICATION_ERROR",
      "HF_TOKEN must be a Hugging Face token starting with hf_.",
    )
  }

  return token as `hf_${string}`
}

function getMusicGenSpaceSlug(): string {
  return process.env.HF_MUSICGEN_SPACE?.trim() || DEFAULT_MUSICGEN_SPACE
}

function clampDuration(duration?: number): number {
  if (duration === undefined) {
    return MUSICGEN_PUBLIC_DEMO_DURATION_SECONDS
  }

  return Math.min(
    MUSICGEN_PUBLIC_DEMO_DURATION_SECONDS,
    Math.max(1, Math.round(duration)),
  )
}

function buildPredictInput(prompt: string): MusicGenGradioPredictInput {
  return {
    texts: prompt,
    melodies: null,
  }
}

function isGradioStatusError(error: unknown): error is GradioPredictStatusError {
  return error instanceof Error
}

function mapGradioError(error: unknown): MusicGenerationError {
  if (error instanceof MusicGenerationError) {
    return error
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new MusicGenerationError("TIMEOUT", "Music generation was cancelled.")
  }

  if (isGradioStatusError(error)) {
    const title = error.title ?? ""
    const message = error.message ?? "Gradio prediction failed."

    if (title === "ZeroGPU client error" || message.includes("ZeroGPU")) {
      return new MusicGenerationError(
        "PROVIDER_ERROR",
        "The public facebook/MusicGen Space rejected this server-side request with a ZeroGPU client error. The Space API is reachable, but generation cannot run from Node.js on the public demo right now.",
        { cause: error },
      )
    }

    if (message.includes("Not authorized") || message.includes("401")) {
      return new MusicGenerationError(
        "AUTHENTICATION_ERROR",
        "Hugging Face authentication failed for the MusicGen Space.",
        { cause: error },
      )
    }

    if (message.includes("busy")) {
      return new MusicGenerationError(
        "RATE_LIMITED",
        "The MusicGen Space queue is busy. Please try again shortly.",
        { cause: error, retryable: true },
      )
    }

    return new MusicGenerationError(
      "PROVIDER_ERROR",
      message,
      { cause: error },
    )
  }

  const message =
    error instanceof Error ? error.message : "Unexpected MusicGen Space error."

  return new MusicGenerationError("UNKNOWN" satisfies MusicGenerationErrorCode, message, {
    cause: error,
  })
}

function extractGradioFile(value: unknown): GradioFileData | null {
  if (typeof value === "string" && value.length > 0) {
    return { path: value, url: value.startsWith("http") ? value : null }
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = extractGradioFile(item)
      if (nested) {
        return nested
      }
    }
    return null
  }

  if (typeof value === "object" && value !== null) {
    const file = value as GradioFileData
    if (typeof file.path === "string" && file.path.length > 0) {
      return file
    }
    if (typeof file.url === "string" && file.url.startsWith("http")) {
      return { ...file, path: file.url }
    }
  }

  return null
}

function resolveAudioDownloadUrl(file: GradioFileData, spaceSlug: string): string {
  if (file.url && file.url.startsWith("http")) {
    return file.url
  }

  const spaceHost = spaceSlug.replace("/", "-").toLowerCase()
  const normalizedPath = file.path.startsWith("/") ? file.path : `/${file.path}`
  return `https://${spaceHost}.hf.space/file=${normalizedPath}`
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  const abortFromParent = () => controller.abort()
  signal?.addEventListener("abort", abortFromParent, { once: true })

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      if (signal?.aborted) {
        throw error
      }

      throw new MusicGenerationError(
        "TIMEOUT",
        "Timed out while downloading generated audio from the MusicGen Space.",
        { cause: error },
      )
    }

    throw new MusicGenerationError(
      "PROVIDER_ERROR",
      "Failed to download generated audio from the MusicGen Space.",
      { cause: error },
    )
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener("abort", abortFromParent)
  }
}

async function downloadAudioFile(
  file: GradioFileData,
  spaceSlug: string,
  signal?: AbortSignal,
): Promise<MusicGenerationResult> {
  const downloadUrl = resolveAudioDownloadUrl(file, spaceSlug)
  const response = await fetchWithTimeout(
    downloadUrl,
    { method: "GET", headers: { Accept: "audio/*" } },
    REQUEST_TIMEOUT_MS,
    signal,
  )

  if (!response.ok) {
    throw new MusicGenerationError(
      "INVALID_AUDIO",
      "Failed to download generated audio from the MusicGen Space.",
      { status: response.status },
    )
  }

  const audio = await response.arrayBuffer()
  if (audio.byteLength === 0) {
    throw new MusicGenerationError(
      "INVALID_AUDIO",
      "Downloaded audio from the MusicGen Space was empty.",
    )
  }

  const mimeType =
    file.mime_type ??
    response.headers.get("content-type")?.split(";")[0]?.trim() ??
    "audio/wav"

  return { audio, mimeType }
}

async function predictFromMusicGenSpace(
  prompt: string,
  signal?: AbortSignal,
): Promise<GradioFileData> {
  const spaceSlug = getMusicGenSpaceSlug()
  const token = getRequiredHuggingFaceToken()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SPACE_TIMEOUT_MS)
  const abortFromParent = () => controller.abort()
  signal?.addEventListener("abort", abortFromParent, { once: true })

  try {
    const client = await Client.connect(spaceSlug, { token })

    const result = await client.predict(
      MUSICGEN_GRADIO_API_NAME,
      buildPredictInput(prompt) as unknown as Record<string, unknown>,
    )

    const file = extractGradioFile(result)
    if (!file) {
      throw new MusicGenerationError(
        "INVALID_AUDIO",
        "The MusicGen Space returned an unexpected audio payload.",
      )
    }

    return file
  } catch (error) {
    throw mapGradioError(error)
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener("abort", abortFromParent)
  }
}

export class HuggingFaceMusicGenProvider implements MusicProvider {
  async generateMusic(input: MusicGenerationInput): Promise<MusicGenerationResult> {
    const prompt = input.prompt.trim()
    if (!prompt) {
      throw new MusicGenerationError("INVALID_REQUEST", "Prompt is required.")
    }

    const duration = clampDuration(input.duration)
    const spaceSlug = getMusicGenSpaceSlug()
    const generatedFile = await predictFromMusicGenSpace(prompt, input.signal)
    const result = await downloadAudioFile(generatedFile, spaceSlug, input.signal)

    return {
      ...result,
      duration,
    }
  }
}

export function createHuggingFaceMusicGenProvider(): MusicProvider {
  return new HuggingFaceMusicGenProvider()
}

/** Backward-compatible alias used by the API route. */
export function createHuggingFaceMusicProvider(): MusicProvider {
  return createHuggingFaceMusicGenProvider()
}

export function mapUnknownProviderError(error: unknown): MusicGenerationError {
  if (error instanceof MusicGenerationError) {
    return error
  }

  return mapGradioError(error)
}

export async function inspectMusicGenSpaceApi(spaceSlug = getMusicGenSpaceSlug()) {
  const token = getRequiredHuggingFaceToken()
  const client = await Client.connect(spaceSlug, { token })
  return client.view_api()
}
