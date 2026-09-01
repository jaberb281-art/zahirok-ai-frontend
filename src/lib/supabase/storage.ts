import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { MusicGenerationError } from "@/lib/music/errors"

export const SONGS_STORAGE_BUCKET = "songs"

let adminClient: SupabaseClient | null = null

function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL?.trim()
  if (!url) {
    throw new MusicGenerationError(
      "MISSING_CONFIGURATION",
      "SUPABASE_URL is not configured on the server.",
    )
  }

  return url
}

function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!key) {
    throw new MusicGenerationError(
      "MISSING_CONFIGURATION",
      "SUPABASE_SERVICE_ROLE_KEY is not configured on the server.",
    )
  }

  return key
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  )
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return adminClient
}

export function buildSongStorageKey(deviceId: string, songId: string): string {
  return `songs/${deviceId}/${songId}.mp3`
}

export async function uploadSongAudio(
  storageKey: string,
  audio: Buffer,
  mimeType: string,
): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.from(SONGS_STORAGE_BUCKET).upload(storageKey, audio, {
    contentType: mimeType,
    upsert: false,
  })

  if (error) {
    throw new MusicGenerationError(
      "PROVIDER_ERROR",
      "Failed to upload generated audio to storage.",
      { cause: error },
    )
  }
}

export async function downloadSongAudio(storageKey: string): Promise<{
  buffer: Buffer
  mimeType: string
}> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.storage.from(SONGS_STORAGE_BUCKET).download(storageKey)

  if (error || !data) {
    throw new MusicGenerationError(
      "INVALID_AUDIO",
      "Stored audio could not be loaded.",
      { cause: error },
    )
  }

  const buffer = Buffer.from(await data.arrayBuffer())
  if (buffer.byteLength === 0) {
    throw new MusicGenerationError("INVALID_AUDIO", "Stored audio file was empty.")
  }

  return {
    buffer,
    mimeType: data.type?.split(";")[0]?.trim() || "audio/mpeg",
  }
}

export async function deleteSongAudio(storageKey: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.from(SONGS_STORAGE_BUCKET).remove([storageKey])

  if (error) {
    console.error("[storage] failed to delete orphaned audio object", {
      storageKey,
      message: error.message,
    })
  }
}
