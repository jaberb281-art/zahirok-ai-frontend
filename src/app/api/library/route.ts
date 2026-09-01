import { NextResponse } from "next/server"

import { getOrCreateDeviceId } from "@/lib/auth/device"
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma"
import { MusicGenerationError } from "@/lib/music/errors"
import { mapSongToLibraryDto } from "@/lib/songs/mappers"

export const runtime = "nodejs"

export async function GET(): Promise<Response> {
  try {
    if (!isDatabaseConfigured()) {
      throw new MusicGenerationError(
        "MISSING_CONFIGURATION",
        "Library persistence is not configured.",
      )
    }

    const deviceId = await getOrCreateDeviceId()
    const songs = await prisma.song.findMany({
      where: {
        deviceId,
        status: "completed",
      },
      orderBy: { createdAt: "desc" },
    })

    const payload = {
      songs: songs.map(mapSongToLibraryDto),
    }

    return NextResponse.json(payload)
  } catch (error) {
    if (error instanceof MusicGenerationError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.status },
      )
    }

    console.error("[library] failed to load songs", error)
    return NextResponse.json(
      { success: false, error: "Failed to load library." },
      { status: 500 },
    )
  }
}
