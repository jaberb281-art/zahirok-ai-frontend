"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2, Pause, Play, Radio, Search } from "lucide-react"

import { usePlaySong } from "@/hooks/use-play-song"
import { fetchRadioStations, radioStationToSong } from "@/lib/radio-client"
import type { RadioStation } from "@/lib/radio/types"

const QUICK_CHIPS = [
  { label: "Pakistan", country: "Pakistan" },
  { label: "Balochi", tag: "balochi" },
  { label: "Urdu", language: "urdu" },
  { label: "Folk", tag: "folk" },
  { label: "World", tag: "world" },
] as const

function StationLogo({ station }: { station: RadioStation }) {
  const [failed, setFailed] = useState(false)

  if (!station.logo || failed) {
    return (
      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-sand/10 bg-saffron/10 text-saffron">
        <Radio className="size-6" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-sand/10 bg-black/30">
      <Image
        src={station.logo}
        alt=""
        fill
        unoptimized
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

export default function RadioPage() {
  const [query, setQuery] = useState("")
  const [activeChip, setActiveChip] = useState<string | null>("Pakistan")
  const [stations, setStations] = useState<RadioStation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { playSong, isCurrentSong, isPlaying } = usePlaySong()

  const loadStations = useCallback(async () => {
    setLoading(true)
    setError("")

    const chip = QUICK_CHIPS.find((item) => item.label === activeChip)

    try {
      const results = await fetchRadioStations({
        country: chip && "country" in chip ? chip.country : undefined,
        language: chip && "language" in chip ? chip.language : undefined,
        tag: chip && "tag" in chip ? chip.tag : undefined,
        q: query.trim() || undefined,
        limit: 48,
      })

      setStations(results)
      if (results.length === 0) {
        setError("No working stations found. Try another search or chip.")
      }
    } catch (loadError) {
      setStations([])
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load radio stations.",
      )
    } finally {
      setLoading(false)
    }
  }, [activeChip, query])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadStations()
    }, query.trim() ? 350 : 0)

    return () => window.clearTimeout(timeout)
  }, [loadStations, query])

  const queue = useMemo(() => stations.map(radioStationToSong), [stations])

  function handlePlay(station: RadioStation) {
    const song = radioStationToSong(station)
    playSong(song, queue)
  }

  return (
    <main className="min-h-dvh bg-[#0d0d0f] px-4 pb-24 pt-6 text-sand sm:px-6 lg:px-8 lg:pb-8 lg:pt-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">Live Radio</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
              Suroz Internet Radio
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/55">
              Stream free stations from around the world. Search by country, language, or genre —
              powered by Radio Browser.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-white/75 transition hover:border-saffron/30 hover:text-white"
          >
            Back to home
          </Link>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <label className="relative block">
            <span className="sr-only">Search radio stations</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/35"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search station name..."
              className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 pl-12 pr-4 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-saffron/35"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_CHIPS.map((chip) => {
              const active = activeChip === chip.label
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setActiveChip(chip.label)}
                  className={`rounded-full border px-4 py-2 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron ${
                    active
                      ? "border-saffron/40 bg-saffron/12 text-saffron"
                      : "border-white/10 bg-black/20 text-white/65 hover:border-white/18 hover:text-white"
                  }`}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div className="mt-10 flex items-center justify-center gap-3 text-sm font-bold text-white/55">
            <Loader2 className="size-5 animate-spin text-saffron" aria-hidden="true" />
            Loading stations...
          </div>
        ) : null}

        {!loading && error ? (
          <p role="status" className="mt-10 text-center text-sm font-bold text-[#ff8f73]">
            {error}
          </p>
        ) : null}

        {!loading && !error ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {stations.map((station) => {
              const song = radioStationToSong(station)
              const playing = isCurrentSong(song) && isPlaying

              return (
                <article
                  key={station.id}
                  className="flex items-center gap-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-saffron/25 hover:bg-white/[0.05]"
                >
                  <StationLogo station={station} />

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-black text-white">{station.name}</h2>
                    <p className="mt-1 truncate text-xs font-semibold text-white/48">
                      {station.country}
                      {station.language ? ` · ${station.language}` : ""}
                      {station.bitrate > 0 ? ` · ${station.bitrate} kbps` : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlay(station)}
                    aria-label={playing ? `Pause ${station.name}` : `Play ${station.name}`}
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full [background:var(--gradient-brand)] text-[#171210] shadow-[0_10px_24px_rgba(227,122,44,0.22)] transition hover:[background:var(--gradient-brand-hover)]"
                  >
                    {playing ? (
                      <Pause className="size-4" aria-hidden="true" />
                    ) : (
                      <Play className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </article>
              )
            })}
          </div>
        ) : null}
      </div>
    </main>
  )
}
