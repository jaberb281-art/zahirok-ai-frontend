import { randomUUID } from "crypto"
import { NextResponse } from "next/server"

import { getOrCreateDeviceId } from "@/lib/auth/device"
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma"
import {
  isMusicGenerationError,
  MusicGenerationError,
  toPublicErrorMessage,
} from "@/lib/music/errors"
import {
  createMusicProvider,
  mapUnknownProviderError,
} from "@/lib/music/providers/index"
import { generateMusicRequestSchema } from "@/lib/music/validation"
import { songAudioUrl } from "@/lib/songs/mappers"
import {
  buildSongStorageKey,
  deleteSongAudio,
  isSupabaseConfigured,
  uploadSongAudio,
} from "@/lib/supabase/storage"

export const runtime = "nodejs"
export const maxDuration = 120

interface GenerateMusicSuccessResponse {
  success: true
  songId: string
  audioUrl: string
  title: string
  duration?: number
  mimeType: string
}

interface GenerateMusicErrorResponse {
  success: false
  error: string
  code: string
}

function assertPersistenceConfigured(): void {
  if (!isDatabaseConfigured()) {
    throw new MusicGenerationError(
      "MISSING_CONFIGURATION",
      "DATABASE_URL is not configured on the server.",
    )
  }

  if (!isSupabaseConfigured()) {
    throw new MusicGenerationError(
      "MISSING_CONFIGURATION",
      "Supabase storage is not configured on the server.",
    )
  }
}

async function markJobFailed(
  jobId: string,
  error: MusicGenerationError,
): Promise<void> {
  try {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        errorCode: error.code,
        errorMessage: toPublicErrorMessage(error),
        completedAt: new Date(),
      },
    })
  } catch (updateError) {
    console.error("[generate] failed to mark generation job as failed", {
      jobId,
      message: updateError instanceof Error ? updateError.message : String(updateError),
    })
  }
}

export async function POST(request: Request): Promise<Response> {
  let jobId: string | null = null

  try {
    assertPersistenceConfigured()

    let body: unknown
    try {
      body = await request.json()
    } catch {
      throw new MusicGenerationError("INVALID_REQUEST", "Request body must be valid JSON.")
    }

    const parsed = generateMusicRequestSchema.safeParse(body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw new MusicGenerationError(
        "INVALID_REQUEST",
        issue?.message ?? "Invalid generation request.",
      )
    }

    const deviceId = await getOrCreateDeviceId()
    const songId = randomUUID()
    const resolvedTitle = parsed.data.title?.trim() || "Untitled"

    const job = await prisma.generationJob.create({
      data: {
        deviceId,
        status: "generating",
        provider: "aimusicapi",
        prompt: parsed.data.prompt,
        lyrics: parsed.data.lyrics ?? "",
        title: resolvedTitle,
        tags: parsed.data.tags ?? "",
        instrumental: parsed.data.instrumental ?? false,
        requestedDurationSec: parsed.data.duration,
        creditsCharged: parsed.data.creditsCharged,
        startedAt: new Date(),
      },
    })
    jobId = job.id

    const provider = createMusicProvider()
    const result = await provider.generateMusic({
      prompt: parsed.data.prompt,
      duration: parsed.data.duration,
      lyrics: parsed.data.lyrics,
      title: parsed.data.title,
      tags: parsed.data.tags,
      instrumental: parsed.data.instrumental,
      useCustomLyrics: parsed.data.useCustomLyrics,
    })

    const audioBuffer = Buffer.from(result.audio)
    const storageKey = buildSongStorageKey(deviceId, songId)

    await uploadSongAudio(storageKey, audioBuffer, result.mimeType)

    let song
    try {
      song = await prisma.song.create({
        data: {
          id: songId,
          deviceId,
          generationJobId: job.id,
          title: resolvedTitle,
          description: parsed.data.description ?? "",
          prompt: parsed.data.prompt,
          lyrics: parsed.data.lyrics ?? "",
          tags: parsed.data.tags ?? "",
          language: parsed.data.language,
          instrumental: parsed.data.instrumental ?? false,
          bpm: parsed.data.bpm,
          musicKey: parsed.data.musicKey,
          requestedDurationSec: parsed.data.duration,
          durationSec: result.duration,
          status: "completed",
          visibility: "private",
          audioStorageKey: storageKey,
          audioMimeType: result.mimeType,
          audioByteSize: BigInt(audioBuffer.byteLength),
          provider: "aimusicapi",
          providerTaskId: result.providerTaskId,
        },
      })
    } catch (dbError) {
      await deleteSongAudio(storageKey)
      throw dbError
    }

    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: "succeeded",
        providerTaskId: result.providerTaskId,
        providerDurationSec: result.duration,
        completedAt: new Date(),
      },
    })

    const responseBody: GenerateMusicSuccessResponse = {
      success: true,
      songId: song.id,
      audioUrl: songAudioUrl(song.id),
      title: song.title,
      duration: result.duration,
      mimeType: result.mimeType,
    }

    return NextResponse.json(responseBody)
  } catch (error) {
    const normalized = isMusicGenerationError(error)
      ? error
      : mapUnknownProviderError(error)

    if (jobId) {
      await markJobFailed(jobId, normalized)
    }

    const responseBody: GenerateMusicErrorResponse = {
      success: false,
      error: toPublicErrorMessage(normalized),
      code: normalized.code,
    }

    return NextResponse.json(responseBody, { status: normalized.status })
  }
}
