import { NextResponse } from "next/server"

import { getOrCreateDeviceId } from "@/lib/auth/device"
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma"
import { MusicGenerationError } from "@/lib/music/errors"
import { assertDeviceOwnsSong, mapSongToDetailDto } from "@/lib/songs/mappers"
import { patchSongSchema, uuidParamSchema } from "@/lib/songs/schemas"

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

    return NextResponse.json(mapSongToDetailDto(song))
  } catch (error) {
    if (error instanceof MusicGenerationError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.status },
      )
    }

    console.error("[songs] failed to load song", error)
    return NextResponse.json(
      { success: false, error: "Failed to load song." },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: Request,
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

    let body: unknown
    try {
      body = await request.json()
    } catch {
      throw new MusicGenerationError("INVALID_REQUEST", "Request body must be valid JSON.")
    }

    const parsedBody = patchSongSchema.safeParse(body)
    if (!parsedBody.success) {
      const issue = parsedBody.error.issues[0]
      throw new MusicGenerationError(
        "INVALID_REQUEST",
        issue?.message ?? "Invalid song update request.",
      )
    }

    const deviceId = await getOrCreateDeviceId()
    const existing = await prisma.song.findUnique({ where: { id: parsedId.data } })

    if (!existing) {
      throw new MusicGenerationError("INVALID_REQUEST", "Song was not found.", { status: 404 })
    }

    assertDeviceOwnsSong(existing, deviceId)

    const updated = await prisma.song.update({
      where: { id: parsedId.data },
      data: {
        ...(parsedBody.data.title !== undefined ? { title: parsedBody.data.title } : {}),
        ...(parsedBody.data.description !== undefined
          ? { description: parsedBody.data.description }
          : {}),
        ...(parsedBody.data.visibility !== undefined
          ? { visibility: parsedBody.data.visibility }
          : {}),
      },
    })

    return NextResponse.json(mapSongToDetailDto(updated))
  } catch (error) {
    if (error instanceof MusicGenerationError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.status },
      )
    }

    console.error("[songs] failed to update song", error)
    return NextResponse.json(
      { success: false, error: "Failed to update song." },
      { status: 500 },
    )
  }
}

export async function DELETE(
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
    const existing = await prisma.song.findUnique({ where: { id: parsedId.data } })

    if (!existing) {
      throw new MusicGenerationError("INVALID_REQUEST", "Song was not found.", { status: 404 })
    }

    assertDeviceOwnsSong(existing, deviceId)

    await prisma.song.update({
      where: { id: parsedId.data },
      data: { status: "archived" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof MusicGenerationError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.status },
      )
    }

    console.error("[songs] failed to archive song", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete song." },
      { status: 500 },
    )
  }
}
