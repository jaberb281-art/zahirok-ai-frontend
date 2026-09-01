import { NextResponse } from "next/server"

import { getOrCreateDeviceId } from "@/lib/auth/device"
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma"
import { MusicGenerationError } from "@/lib/music/errors"
import { assertDeviceOwnsSong } from "@/lib/songs/mappers"
import { uuidParamSchema } from "@/lib/songs/schemas"
import { downloadSongAudio } from "@/lib/supabase/storage"

export const runtime = "nodejs"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  try {
    if (!isDatabaseConfigured()) {
      throw new MusicGenerationError(
        "MISSING_CONFIGURATION",
        "Song persistence is not configured.",
      )
    }

    const { id } = await context.params
    const parsedId = uuidParamSchema.safeParse(id)
    if (!parsedId.success) {
      throw new MusicGenerationError("INVALID_REQUEST", "Song was not found.", { status: 404 })
    }

    const deviceId = await getOrCreateDeviceId()
    const song = await prisma.song.findUnique({ where: { id: parsedId.data } })

    if (!song) {
      throw new MusicGenerationError("INVALID_REQUEST", "Song was not found.", { status: 404 })
    }

    assertDeviceOwnsSong(song, deviceId)

    const audio = await downloadSongAudio(song.audioStorageKey)

    return new Response(new Uint8Array(audio.buffer), {
      status: 200,
      headers: {
        "Content-Type": song.audioMimeType || audio.mimeType,
        "Cache-Control": "private, max-age=3600",
        "Content-Length": String(audio.buffer.byteLength),
        "Accept-Ranges": "bytes",
      },
    })
  } catch (error) {
    if (error instanceof MusicGenerationError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.status },
      )
    }

    console.error("[songs/audio] failed to stream song", error)
    return NextResponse.json(
      { success: false, error: "Failed to load audio." },
      { status: 500 },
    )
  }
}
