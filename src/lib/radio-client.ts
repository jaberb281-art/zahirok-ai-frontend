import type { Song } from "@/lib/types"
import type { RadioStation } from "@/lib/radio/types"

export function radioStationToSong(station: RadioStation): Song {
  return {
    id: `station-${station.id}`,
    title: station.name,
    prompt: `Live radio · ${station.country}${station.language ? ` · ${station.language}` : ""}`,
    genrePreset: "Custom Prompt",
    instruments: ["Suroz"],
    lyrics: "",
    status: "completed",
    audioUrl: station.streamUrl,
    mp3Url: station.streamUrl,
    wavUrl: station.streamUrl,
    isPublic: true,
    createdAt: new Date().toISOString(),
    duration: "Live",
    plays: 0,
    likes: 0,
    remixes: 0,
  }
}

export async function fetchRadioStations(params: {
  country?: string
  language?: string
  tag?: string
  q?: string
  limit?: number
}): Promise<RadioStation[]> {
  const search = new URLSearchParams()
  if (params.country) search.set("country", params.country)
  if (params.language) search.set("language", params.language)
  if (params.tag) search.set("tag", params.tag)
  if (params.q) search.set("q", params.q)
  if (params.limit) search.set("limit", String(params.limit))

  const response = await fetch(`/api/radio/stations?${search.toString()}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(payload.error ?? "Failed to load radio stations.")
  }

  const payload = (await response.json()) as { stations: RadioStation[] }
  return payload.stations ?? []
}
