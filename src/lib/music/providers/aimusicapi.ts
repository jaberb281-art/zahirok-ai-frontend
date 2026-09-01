import { MusicGenerationError } from "@/lib/music/errors"
import type {
  MusicGenerationInput,
  MusicGenerationResult,
  MusicProvider,
} from "@/lib/music/types"
import {
  GPT_DESCRIPTION_MAX_LENGTH,
  TAGS_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from "@/lib/music/validation"

export const AIMUSICAPI_BASE_URL = "https://api.aimusicapi.ai"
export const AIMUSICAPI_CREATE_PATH = "/api/v1/sonic/create"
export const AIMUSICAPI_TASK_PATH = "/api/v1/sonic/task"
export const AIMUSICAPI_MODEL_VERSION = "sonic-v5"
export const AIMUSICAPI_POLL_INTERVAL_MS = 18_000
export const AIMUSICAPI_MAX_POLL_DURATION_MS = 110_000
export const AIMUSICAPI_REQUEST_TIMEOUT_MS = 30_000

export type SonicTaskState = "pending" | "running" | "succeeded" | "failed"

export interface DescriptionModeCreatePayload {
  task_type: "create_music"
  custom_mode: false
  mv: string
  gpt_description_prompt: string
  make_instrumental?: boolean
  duration?: number
  use_suno_cdn: false
}

export interface CustomLyricsCreatePayload {
  task_type: "create_music"
  custom_mode: true
  mv: string
  title: string
  tags: string
  prompt: string
  make_instrumental?: boolean
  duration?: number
  use_suno_cdn: false
}

export type SonicCreatePayload = DescriptionModeCreatePayload | CustomLyricsCreatePayload

export interface SonicCreateResponse {
  code?: number
  task_id?: string
  message?: string
}

export interface SonicSongResult {
  clip_id?: string
  state?: SonicTaskState | string
  title?: string
  tags?: string
  lyrics?: string
  audio_url?: string
  image_url?: string
  duration?: number
}

export interface SonicTaskResponse {
  code?: number
  message?: string
  data?: SonicSongResult[]
}

interface ProviderRequestOptions {
  method: "GET" | "POST"
  path: string
  body?: SonicCreatePayload
  signal?: AbortSignal
}

function getApiKey(): string {
  const apiKey = process.env.AIMUSICAPI_KEY?.trim()
  if (!apiKey) {
    throw new MusicGenerationError(
      "MISSING_CONFIGURATION",
      "AIMUSICAPI_KEY is not configured on the server.",
    )
  }

  return apiKey
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value
  }

  return value.slice(0, maxLength).trimEnd()
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"))
      return
    }

    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort)
      resolve()
    }, ms)

    const onAbort = () => {
      clearTimeout(timeout)
      reject(new DOMException("Aborted", "AbortError"))
    }

    signal?.addEventListener("abort", onAbort, { once: true })
  })
}

function normalizeProviderMessage(payload: unknown): string {
  if (typeof payload === "string") {
    return payload
  }

  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>
    const parts = [record.message, record.error, record.detail]
      .filter((value): value is string => typeof value === "string" && value.length > 0)

    if (parts.length > 0) {
      return parts.join(" ")
    }
  }

  return "AI Music API request failed."
}

function mapHttpStatusToError(status: number, message: string): MusicGenerationError {
  const normalized = message.toLowerCase()

  if (status === 401 || status === 403) {
    return new MusicGenerationError(
      "AUTHENTICATION_ERROR",
      "AI Music API authentication failed.",
      { status },
    )
  }

  if (
    status === 402 ||
    normalized.includes("insufficient credit") ||
    normalized.includes("not enough credit") ||
    normalized.includes("credit balance")
  ) {
    return new MusicGenerationError(
      "INSUFFICIENT_CREDITS",
      "AI Music API account has insufficient credits.",
      { status },
    )
  }

  if (status === 429 || normalized.includes("rate limit")) {
    return new MusicGenerationError(
      "RATE_LIMITED",
      "AI Music API rate limit reached.",
      { status, retryable: true },
    )
  }

  return new MusicGenerationError(
    "PROVIDER_ERROR",
    message || "AI Music API request failed.",
    { status },
  )
}

async function providerRequest<T>(
  options: ProviderRequestOptions,
): Promise<T> {
  const apiKey = getApiKey()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), AIMUSICAPI_REQUEST_TIMEOUT_MS)

  const abortFromParent = () => controller.abort()
  options.signal?.addEventListener("abort", abortFromParent, { once: true })

  try {
    const response = await fetch(`${AIMUSICAPI_BASE_URL}${options.path}`, {
      method: options.method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    })

    let payload: unknown = null
    const contentType = response.headers.get("content-type") ?? ""

    if (contentType.includes("application/json")) {
      try {
        payload = await response.json()
      } catch {
        payload = null
      }
    } else {
      const text = await response.text()
      payload = text ? { message: text } : null
    }

    if (!response.ok) {
      throw mapHttpStatusToError(
        response.status,
        normalizeProviderMessage(payload),
      )
    }

    return payload as T
  } catch (error) {
    if (error instanceof MusicGenerationError) {
      throw error
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      if (options.signal?.aborted) {
        throw error
      }

      throw new MusicGenerationError(
        "TIMEOUT",
        "AI Music API request timed out.",
        { cause: error },
      )
    }

    throw new MusicGenerationError(
      "PROVIDER_ERROR",
      "Unable to reach AI Music API.",
      { cause: error },
    )
  } finally {
    clearTimeout(timeout)
    options.signal?.removeEventListener("abort", abortFromParent)
  }
}

export function buildSonicCreatePayload(input: MusicGenerationInput): SonicCreatePayload {
  const base = {
    task_type: "create_music" as const,
    mv: AIMUSICAPI_MODEL_VERSION,
    use_suno_cdn: false as const,
    ...(input.instrumental ? { make_instrumental: true } : {}),
    ...(input.duration ? { duration: input.duration } : {}),
  }

  if (input.useCustomLyrics && input.lyrics?.trim()) {
    return {
      ...base,
      custom_mode: true,
      title: truncate(input.title?.trim() || "Soroz Track", TITLE_MAX_LENGTH),
      tags: truncate(input.tags?.trim() || "Balochi, cinematic, emotional", TAGS_MAX_LENGTH),
      prompt: input.lyrics.trim(),
    }
  }

  return {
    ...base,
    custom_mode: false,
    gpt_description_prompt: truncate(input.prompt.trim(), GPT_DESCRIPTION_MAX_LENGTH),
  }
}

export function extractCompletedSong(
  payload: SonicTaskResponse,
): SonicSongResult | null {
  const songs = payload.data ?? []

  for (const song of songs) {
    if (typeof song.audio_url === "string" && song.audio_url.startsWith("http")) {
      const state = (song.state ?? "succeeded").toLowerCase()
      if (state === "failed") {
        continue
      }

      return song
    }
  }

  return null
}

export function getTaskFailureMessage(payload: SonicTaskResponse): string | null {
  const songs = payload.data ?? []
  const failedSong = songs.find((song) => song.state?.toLowerCase() === "failed")

  if (failedSong) {
    return "AI Music API reported that the generation task failed."
  }

  const message = payload.message?.toLowerCase() ?? ""
  if (message.includes("fail")) {
    return payload.message ?? "AI Music API generation failed."
  }

  return null
}

export function isTaskStillRunning(payload: SonicTaskResponse): boolean {
  const songs = payload.data ?? []

  if (songs.length === 0) {
    return true
  }

  return songs.some((song) => {
    const state = song.state?.toLowerCase()
    return state === "pending" || state === "running" || !state
  })
}

async function createGenerationTask(
  payload: SonicCreatePayload,
  signal?: AbortSignal,
): Promise<string> {
  const response = await providerRequest<SonicCreateResponse>({
    method: "POST",
    path: AIMUSICAPI_CREATE_PATH,
    body: payload,
    signal,
  })

  if (!response.task_id) {
    throw new MusicGenerationError(
      "PROVIDER_ERROR",
      "AI Music API did not return a task_id.",
    )
  }

  return response.task_id
}

async function pollGenerationTask(
  taskId: string,
  signal?: AbortSignal,
): Promise<SonicSongResult> {
  const startedAt = Date.now()

  while (Date.now() - startedAt < AIMUSICAPI_MAX_POLL_DURATION_MS) {
    const response = await providerRequest<SonicTaskResponse>({
      method: "GET",
      path: `${AIMUSICAPI_TASK_PATH}/${encodeURIComponent(taskId)}`,
      signal,
    })

    const failureMessage = getTaskFailureMessage(response)
    if (failureMessage) {
      throw new MusicGenerationError("GENERATION_FAILED", failureMessage)
    }

    const completedSong = extractCompletedSong(response)
    if (completedSong?.audio_url) {
      return completedSong
    }

    if (!isTaskStillRunning(response)) {
      throw new MusicGenerationError(
        "PROVIDER_ERROR",
        "AI Music API returned a completed task without audio.",
      )
    }

    await sleep(AIMUSICAPI_POLL_INTERVAL_MS, signal)
  }

  throw new MusicGenerationError(
    "TIMEOUT",
    "AI Music API generation timed out before the task completed.",
  )
}

async function downloadGeneratedAudio(
  audioUrl: string,
  signal?: AbortSignal,
): Promise<{ audio: ArrayBuffer; mimeType: string }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), AIMUSICAPI_REQUEST_TIMEOUT_MS)
  const abortFromParent = () => controller.abort()
  signal?.addEventListener("abort", abortFromParent, { once: true })

  try {
    const response = await fetch(audioUrl, {
      method: "GET",
      headers: { Accept: "audio/*" },
      signal: controller.signal,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new MusicGenerationError(
        "INVALID_AUDIO",
        "Failed to download generated audio from AI Music API.",
        { status: response.status },
      )
    }

    const audio = await response.arrayBuffer()
    if (audio.byteLength === 0) {
      throw new MusicGenerationError(
        "INVALID_AUDIO",
        "Downloaded audio from AI Music API was empty.",
      )
    }

    const mimeType =
      response.headers.get("content-type")?.split(";")[0]?.trim() || "audio/mpeg"

    return { audio, mimeType }
  } catch (error) {
    if (error instanceof MusicGenerationError) {
      throw error
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      if (signal?.aborted) {
        throw error
      }

      throw new MusicGenerationError(
        "TIMEOUT",
        "Timed out while downloading generated audio.",
        { cause: error },
      )
    }

    throw new MusicGenerationError(
      "INVALID_AUDIO",
      "Failed to download generated audio from AI Music API.",
      { cause: error },
    )
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener("abort", abortFromParent)
  }
}

export class AIMusicAPIProvider implements MusicProvider {
  async generateMusic(input: MusicGenerationInput): Promise<MusicGenerationResult> {
    const prompt = input.prompt.trim()

    if (!prompt && !(input.useCustomLyrics && input.lyrics?.trim())) {
      throw new MusicGenerationError("INVALID_REQUEST", "Prompt is required.")
    }

    const createPayload = buildSonicCreatePayload({
      ...input,
      prompt: prompt || input.lyrics?.trim() || "",
    })

    const taskId = await createGenerationTask(createPayload, input.signal)
    const completedSong = await pollGenerationTask(taskId, input.signal)

    if (!completedSong.audio_url) {
      throw new MusicGenerationError(
        "INVALID_AUDIO",
        "AI Music API completed without an audio URL.",
      )
    }

    const downloaded = await downloadGeneratedAudio(
      completedSong.audio_url,
      input.signal,
    )

    return {
      audio: downloaded.audio,
      mimeType: downloaded.mimeType,
      duration: completedSong.duration,
      providerTaskId: taskId,
    }
  }
}

export function createAIMusicAPIProvider(): MusicProvider {
  return new AIMusicAPIProvider()
}

export function mapUnknownProviderError(error: unknown): MusicGenerationError {
  if (error instanceof MusicGenerationError) {
    return error
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new MusicGenerationError("TIMEOUT", "Music generation was cancelled.")
  }

  const message =
    error instanceof Error ? error.message : "Unexpected music generation error."

  return new MusicGenerationError("UNKNOWN", message, { cause: error })
}
