import type { Song as PrismaSong } from "@prisma/client"

import { MusicGenerationError } from "@/lib/music/errors"
import type { GenrePreset, Instrument, Song } from "@/lib/types"

export function assertDeviceOwnsSong(
  song: Pick<PrismaSong, "deviceId" | "status">,
  deviceId: string,
): void {
  if (song.status === "archived") {
    throw new MusicGenerationError("INVALID_REQUEST", "Song was not found.", { status: 404 })
  }

  if (!song.deviceId || song.deviceId !== deviceId) {
    throw new MusicGenerationError("INVALID_REQUEST", "Song was not found.", { status: 404 })
  }
}

export function songAudioUrl(songId: string): string {
  return `/api/songs/${songId}/audio`
}

export function formatDurationLabel(durationSec: number | null | undefined): string {
  if (durationSec == null || !Number.isFinite(Number(durationSec))) {
    return "0:30"
  }

  const totalSeconds = Math.max(0, Math.round(Number(durationSec)))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export interface LibrarySongDto {
  id: string
  title: string
  description: string
  prompt: string
  duration: number | null
  audioUrl: string
  createdAt: string
  instrumental: boolean
  tags: string
  visibility: "private" | "public"
}

export interface SongDetailDto {
  id: string
  title: string
  description: string
  prompt: string
  lyrics: string
  tags: string
  language: string | null
  instrumental: boolean
  bpm: number | null
  musicKey: string | null
  duration: number | null
  createdAt: string
  updatedAt: string
  audioUrl: string
  visibility: "private" | "public"
}

export function mapSongToLibraryDto(song: PrismaSong): LibrarySongDto {
  return {
    id: song.id,
    title: song.title,
    description: song.description,
    prompt: song.prompt,
    duration: song.durationSec != null ? Number(song.durationSec) : null,
    audioUrl: songAudioUrl(song.id),
    createdAt: song.createdAt.toISOString(),
    instrumental: song.instrumental,
    tags: song.tags,
    visibility: song.visibility,
  }
}

export function mapSongToDetailDto(song: PrismaSong): SongDetailDto {
  return {
    id: song.id,
    title: song.title,
    description: song.description,
    prompt: song.prompt,
    lyrics: song.lyrics,
    tags: song.tags,
    language: song.language,
    instrumental: song.instrumental,
    bpm: song.bpm,
    musicKey: song.musicKey,
    duration: song.durationSec != null ? Number(song.durationSec) : null,
    createdAt: song.createdAt.toISOString(),
    updatedAt: song.updatedAt.toISOString(),
    audioUrl: songAudioUrl(song.id),
    visibility: song.visibility,
  }
}

export function mapLibraryDtoToPlayerSong(dto: LibrarySongDto): Song {
  const audioUrl = dto.audioUrl
  return {
    id: dto.id,
    title: dto.title,
    prompt: dto.prompt || dto.description,
    genrePreset: "Custom Prompt" as GenrePreset,
    instruments: ["Suroz"] as Instrument[],
    lyrics: "",
    status: "completed",
    audioUrl,
    mp3Url: audioUrl,
    wavUrl: audioUrl,
    isPublic: dto.visibility === "public",
    createdAt: dto.createdAt,
    duration: formatDurationLabel(dto.duration),
    plays: 0,
    likes: 0,
    remixes: 0,
  }
}
