import type { RadioStation } from "@/lib/radio/types"

export const RADIO_BROWSER_API_BASE = "https://de1.api.radio-browser.info"
export const RADIO_BROWSER_USER_AGENT = "Suroz/1.0 (https://suroz.ai; radio feature)"

interface RadioBrowserStation {
  stationuuid?: string
  name?: string
  favicon?: string
  country?: string
  language?: string
  tags?: string
  bitrate?: number
  url?: string
  url_resolved?: string
  lastcheckok?: number
  codec?: string
}

function isWorkingStation(station: RadioBrowserStation): boolean {
  if (station.lastcheckok !== 1) return false

  const streamUrl = station.url_resolved?.trim() || station.url?.trim()
  if (!streamUrl) return false
  if (!/^https?:\/\//i.test(streamUrl)) return false

  return true
}

export function mapRadioBrowserStation(station: RadioBrowserStation): RadioStation | null {
  if (!isWorkingStation(station) || !station.stationuuid) {
    return null
  }

  const streamUrl = station.url_resolved?.trim() || station.url!.trim()

  return {
    id: station.stationuuid,
    name: station.name?.trim() || "Unknown Station",
    logo: station.favicon?.trim() && station.favicon.trim() !== "null" ? station.favicon.trim() : "",
    country: station.country?.trim() || "Unknown",
    language: station.language?.trim() || "",
    tags: station.tags?.trim() || "",
    bitrate: typeof station.bitrate === "number" ? station.bitrate : 0,
    streamUrl,
  }
}

export async function fetchRadioBrowserStations(options: {
  country?: string
  language?: string
  tag?: string
  q?: string
  limit?: number
}): Promise<RadioStation[]> {
  const limit = Math.min(Math.max(options.limit ?? 40, 1), 100)
  const params = new URLSearchParams()
  params.set("hidebroken", "true")
  params.set("lastcheckok", "true")
  params.set("limit", String(limit))
  params.set("order", "votes")
  params.set("reverse", "true")

  if (options.country?.trim()) {
    params.set("country", options.country.trim())
  }

  if (options.language?.trim()) {
    params.set("language", options.language.trim())
  }

  if (options.tag?.trim()) {
    params.set("tag", options.tag.trim())
  }

  if (options.q?.trim()) {
    params.set("name", options.q.trim())
  }

  const path =
    options.country?.trim() && !options.language?.trim() && !options.tag?.trim() && !options.q?.trim()
      ? `/json/stations/bycountry/${encodeURIComponent(options.country.trim())}`
      : options.language?.trim() && !options.country?.trim() && !options.tag?.trim() && !options.q?.trim()
        ? `/json/stations/bylanguage/${encodeURIComponent(options.language.trim())}`
        : options.tag?.trim() && !options.country?.trim() && !options.language?.trim() && !options.q?.trim()
          ? `/json/stations/bytag/${encodeURIComponent(options.tag.trim())}`
          : `/json/stations/search?${params.toString()}`

  const response = await fetch(`${RADIO_BROWSER_API_BASE}${path}`, {
    headers: {
      "User-Agent": RADIO_BROWSER_USER_AGENT,
      Accept: "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Radio Browser API returned ${response.status}.`)
  }

  const payload = (await response.json()) as RadioBrowserStation[]
  if (!Array.isArray(payload)) {
    return []
  }

  const seen = new Set<string>()
  const stations: RadioStation[] = []

  for (const item of payload) {
    const mapped = mapRadioBrowserStation(item)
    if (!mapped || seen.has(mapped.id)) continue
    seen.add(mapped.id)
    stations.push(mapped)
    if (stations.length >= limit) break
  }

  return stations
}
