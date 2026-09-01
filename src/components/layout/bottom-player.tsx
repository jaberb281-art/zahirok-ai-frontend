"use client"

import { useCallback, useMemo } from "react"
import Link from "next/link"
import {
    Pause,
    Play,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    X,
} from "lucide-react"

import { DemoVideoPoster } from "@/components/media/demo-video"
import { getDemoImage } from "@/lib/demo-images"
import { usePlayerStore } from "@/stores/player-store"
import type { GenrePreset, Song } from "@/lib/types"

const GENRE_GRADIENTS: Record<GenrePreset, string> = {
    Soroz: "from-saffron/80 to-terracotta/60",
    Liko: "from-amber-500/70 to-orange-700/60",
    Sout: "from-emerald-600/70 to-teal-800/60",
    Naat: "from-violet-600/70 to-indigo-800/60",
    "Modern Balochi Pop": "from-pink-500/70 to-rose-700/60",
    Wedding: "from-yellow-400/70 to-amber-600/60",
    Lullaby: "from-sky-500/70 to-blue-700/60",
    Sufi: "from-purple-600/70 to-violet-900/60",
    "Hip-Hop Fusion": "from-zinc-400/70 to-zinc-700/60",
    "Custom Prompt": "from-sand/40 to-charcoal/60",
}

function songArtIndex(song: Song): number {
    let hash = 0
    for (let index = 0; index < song.id.length; index += 1) {
        hash = (hash * 31 + song.id.charCodeAt(index)) % 997
    }
    return hash
}

function TrackArtwork({ song }: { song: Song }) {
    const artworkSrc = useMemo(() => getDemoImage(songArtIndex(song)), [song.id])
    const gradient = GENRE_GRADIENTS[song.genrePreset] ?? GENRE_GRADIENTS["Custom Prompt"]

    return (
        <div className="relative size-10 shrink-0 overflow-hidden rounded-md">
            <div
                className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
                aria-hidden="true"
            />
            <DemoVideoPoster
                src={artworkSrc}
                className="absolute inset-0 h-full w-full object-cover"
            />
        </div>
    )
}

function formatClock(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function BottomPlayer() {
    const {
        currentSong,
        isPlaying,
        progress,
        duration,
        volume,
        pause,
        resume,
        stop,
        setProgress,
        setVolume,
        playNext,
        playPrev,
    } = usePlayerStore()

    // Progress, elapsed time, and total duration are all driven by the real
    // Howler engine in the store — there is no simulated ticking here.
    const safeProgress = Number.isFinite(progress) ? progress : 0
    const isStation = currentSong?.id.startsWith("station-") ?? false
    const hasTimedDuration = !isStation && duration > 0
    const elapsedSeconds = hasTimedDuration ? (safeProgress / 100) * duration : 0
    const elapsedLabel = hasTimedDuration ? formatClock(elapsedSeconds) : "0:00"
    const durationLabel = isStation
        ? "Live"
        : hasTimedDuration
          ? formatClock(duration)
          : "0:00"

    const songPath = currentSong?.id.startsWith("station-")
        ? "/radio"
        : currentSong
          ? `/song/${currentSong.id}`
          : "#"

    const handleProgressSeek = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            const rect = event.currentTarget.getBoundingClientRect()
            const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
            setProgress(ratio * 100)
        },
        [setProgress],
    )

    if (!currentSong) return null

    return (
        <div className="player-bar bottom-player fixed bottom-[var(--app-bottom-player-offset)] left-0 right-0 z-[100] h-[var(--app-bottom-player-height)] bg-[rgba(10,10,10,0.95)] backdrop-blur-[20px] transition-[bottom,left] duration-200 lg:bottom-0 lg:left-[var(--app-sidebar-width,248px)]">
            {/* Mobile: passive progress hairline along the top edge (no seek/thumb). */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-white/10 lg:hidden"
            >
                <div
                    className="player-progress-fill h-full bg-saffron transition-[width] duration-100 ease-linear"
                    style={{ width: `${safeProgress}%` }}
                />
            </div>

            {/* Desktop: interactive seek bar (unchanged). */}
            <div
                role="slider"
                aria-label="Playback progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(safeProgress)}
                aria-valuetext={`${elapsedLabel} of ${durationLabel}`}
                tabIndex={0}
                className="player-progress-track absolute inset-x-0 top-0 hidden h-[2px] cursor-pointer bg-white/10 lg:block"
                onClick={handleProgressSeek}
                onKeyDown={(event) => {
                    if (event.key === "ArrowRight") {
                        setProgress(Math.min(100, safeProgress + 2))
                    }
                    if (event.key === "ArrowLeft") {
                        setProgress(Math.max(0, safeProgress - 2))
                    }
                }}
            >
                <div
                    className="player-progress-fill h-full bg-saffron transition-[width] duration-100 ease-linear"
                    style={{ width: `${safeProgress}%` }}
                />
            </div>

            <div className="mx-auto flex h-full max-w-7xl flex-nowrap items-center gap-4 px-4">
                {/* Left — track info (takes the available width on mobile) */}
                <div className="flex min-w-0 flex-1 items-center gap-2.5 lg:min-w-[180px] lg:flex-none lg:shrink-0">
                    <Link
                        href={songPath}
                        aria-label="Open track"
                        className="shrink-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                    >
                        <TrackArtwork song={currentSong} />
                    </Link>
                    <Link
                        href={songPath}
                        className="min-w-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                    >
                        <p className="truncate text-[13px] font-medium leading-tight text-white">
                            {currentSong.title}
                        </p>
                        <p className="truncate text-[11px] leading-tight text-white/50">
                            {currentSong.genrePreset}
                        </p>
                    </Link>
                </div>

                {/* Center — transport (full set on desktop; play/pause + next on mobile) */}
                <div className="flex min-w-0 flex-nowrap items-center justify-center gap-3 lg:flex-1 lg:gap-5">
                    <button
                        type="button"
                        onClick={playPrev}
                        aria-label="Previous track"
                        className="inline-flex size-7 shrink-0 items-center justify-center text-white/55 transition hover:text-white"
                    >
                        <SkipBack className="size-4" aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={isPlaying ? pause : resume}
                        aria-label={isPlaying ? "Pause" : "Play"}
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-saffron hover:text-charcoal"
                    >
                        {isPlaying ? (
                            <Pause className="size-3.5 fill-current" aria-hidden="true" />
                        ) : (
                            <Play className="ml-0.5 size-3.5 fill-current" aria-hidden="true" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={playNext}
                        aria-label="Next track"
                        className="inline-flex size-7 shrink-0 items-center justify-center text-white/55 transition hover:text-white"
                    >
                        <SkipForward className="size-4" aria-hidden="true" />
                    </button>

                    <span className="hidden shrink-0 text-[11px] tabular-nums text-white/40 lg:inline">
                        {elapsedLabel} / {durationLabel}
                    </span>
                </div>

                {/* Right — volume + close (desktop only) */}
                <div className="hidden shrink-0 flex-nowrap items-center gap-3 lg:flex">
                    <button
                        type="button"
                        onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
                        aria-label={volume === 0 ? "Unmute" : "Mute"}
                        className="inline-flex size-7 items-center justify-center text-white/55 transition hover:text-white"
                    >
                        {volume === 0 ? (
                            <VolumeX className="size-4" aria-hidden="true" />
                        ) : (
                            <Volume2 className="size-4" aria-hidden="true" />
                        )}
                    </button>

                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(event) => setVolume(Number(event.target.value))}
                        aria-label="Volume"
                        className="h-1 w-[70px] cursor-pointer accent-saffron"
                    />

                    <button
                        type="button"
                        onClick={stop}
                        aria-label="Close player"
                        className="inline-flex size-7 items-center justify-center text-white/45 transition hover:text-white"
                    >
                        <X className="size-4" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    )
}
