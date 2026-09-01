import type { Song } from "@/lib/types"

import { mapLibraryDtoToPlayerSong, type LibrarySongDto } from "@/lib/songs/mappers"

export interface LibraryResponse {
  songs: LibrarySongDto[]
}

export async function fetchLibrary(): Promise<Song[]> {
  const response = await fetch("/api/library", {
    method: "GET",
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to load library.")
  }

  const payload = (await response.json()) as LibraryResponse
  return payload.songs.map(mapLibraryDtoToPlayerSong)
}

export interface SongDetailResponse {
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

export async function fetchSongDetail(id: string): Promise<SongDetailResponse> {
  const response = await fetch(`/api/songs/${encodeURIComponent(id)}`, {
    method: "GET",
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Song was not found.")
  }

  return (await response.json()) as SongDetailResponse
}

export async function archiveSong(id: string): Promise<void> {
  const response = await fetch(`/api/songs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete song.")
  }
}

export async function renameSongOnServer(id: string, title: string): Promise<void> {
  const response = await fetch(`/api/songs/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  })

  if (!response.ok) {
    throw new Error("Failed to rename song.")
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isPersistedSongId(id: string): boolean {
  return UUID_PATTERN.test(id)
}
