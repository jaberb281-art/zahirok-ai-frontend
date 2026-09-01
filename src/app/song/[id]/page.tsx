"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
    ArrowLeft,
    Bookmark,
    CalendarDays,
    Clock3,
    Globe2,
    Heart,
    Headphones,
    Lock,
    Music2,
    Pause,
    Play,
    RefreshCcw,
    Share2,
    Sparkles,
    UserPlus,
} from "lucide-react"

import { usePlaySong } from "@/hooks/use-play-song"
import { AudioWaveform } from "@/components/ui/audio-waveform"
import { CommentsThread } from "@/components/songs/comments-thread"
import {
    fetchSongDetail,
    isPersistedSongId,
    type SongDetailResponse,
} from "@/lib/library-client"
import { providerDurationToLabel } from "@/lib/music-client"
import {
    formatCount,
    getFeedSongs,
    getMockSongById,
    toPlayerSong,
    type MockSong,
} from "@/lib/mock-songs"
import { profilePathForCreator } from "@/lib/public-profiles"
import type { Song } from "@/lib/types"
import { useLibraryHydrated, useLibraryStore } from "@/stores/library-store"

// Adapt a player Song from the library store to the MockSong shape this page
// renders, supplying defaults for the fields generated tracks don't carry.
function librarySongToMockSong(song: Song): MockSong {
    return {
        ...song,
        dialect: "Makkuran",
        creator: "You",
        comments: 0,
        gradient:
            "linear-gradient(135deg,rgba(227,122,44,0.6) 0%,rgba(183,62,31,0.35) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass: "",
    }
}

function persistedSongToMockSong(detail: SongDetailResponse): MockSong {
    const audioUrl = detail.audioUrl
    return {
        id: detail.id,
        title: detail.title,
        prompt: detail.prompt,
        genrePreset: "Custom Prompt",
        instruments: ["Suroz"],
        lyrics: detail.lyrics,
        status: "completed",
        audioUrl,
        mp3Url: audioUrl,
        wavUrl: audioUrl,
        isPublic: detail.visibility === "public",
        createdAt: detail.createdAt,
        duration: providerDurationToLabel(detail.duration ?? undefined),
        plays: 0,
        likes: 0,
        remixes: 0,
        dialect: "Makkuran",
        creator: "You",
        comments: 0,
        gradient:
            "linear-gradient(135deg,rgba(227,122,44,0.6) 0%,rgba(183,62,31,0.35) 60%,rgba(26,22,18,0.95) 100%)",
        coverClass: "",
    }
}

type DetailTab = "lyrics" | "prompt" | "details"

const FEED_SONGS = getFeedSongs()

function getIdFromParams(value: string | string[] | undefined) {
    if (Array.isArray(value)) return value[0] ?? ""
    return value ?? ""
}

function getSongDescription(song: MockSong) {
    return `A ${song.dialect} ${song.genrePreset} track shaped with coastal rhythm, warm vocals, and cinematic Balochi atmosphere.`
}

function pickRelatedSongs(song: MockSong) {
    const related = FEED_SONGS.filter((candidate) => candidate.id !== song.id)
        .sort((a, b) => {
            const aScore =
                (a.creator === song.creator ? 3 : 0) +
                (a.genrePreset === song.genrePreset ? 2 : 0) +
                (a.dialect === song.dialect ? 1 : 0)
            const bScore =
                (b.creator === song.creator ? 3 : 0) +
                (b.genrePreset === song.genrePreset ? 2 : 0) +
                (b.dialect === song.dialect ? 1 : 0)

            return bScore - aScore
        })

    return related.slice(0, 6)
}

function formatCreatedAt(value: string) {
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value))
}

export default function SongDetailPage() {
    const params = useParams()
    const id = getIdFromParams(params.id)
    const hydrated = useLibraryHydrated()
    const storeSong = useLibraryStore((state) =>
        state.songs.find((item) => item.id === id),
    )
    const [fetchedSong, setFetchedSong] = useState<MockSong | null>(null)
    const [fetchState, setFetchState] = useState<"loading" | "done">(() =>
        isPersistedSongId(id) ? "loading" : "done",
    )
    const song =
        getMockSongById(id) ??
        fetchedSong ??
        (storeSong ? librarySongToMockSong(storeSong) : undefined)
    const [activeTab, setActiveTab] = useState<DetailTab>("lyrics")
    const [liked, setLiked] = useState(false)
    const [saved, setSaved] = useState(false)
    const [message, setMessage] = useState("")
    const { playSong, isCurrentSong, isPlaying } = usePlaySong()

    useEffect(() => {
        if (!isPersistedSongId(id)) {
            return
        }

        let cancelled = false

        void fetchSongDetail(id)
            .then((detail) => {
                if (!cancelled) {
                    setFetchedSong(persistedSongToMockSong(detail))
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setFetchedSong(null)
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setFetchState("done")
                }
            })

        return () => {
            cancelled = true
        }
    }, [id])

    const relatedSongs = useMemo(() => (song ? pickRelatedSongs(song) : []), [song])
    const queue = useMemo(() => {
        if (!song) return FEED_SONGS.map(toPlayerSong)

        const ordered = [
            song,
            ...FEED_SONGS.filter((candidate) => candidate.id !== song.id),
        ]

        return ordered.map(toPlayerSong)
    }, [song])

    if (!song) {
        if (isPersistedSongId(id) && fetchState === "loading") return null
        // A store-backed track may still be rehydrating; wait before showing 404.
        if (!hydrated && !isPersistedSongId(id)) return null
        return <SongNotFound />
    }

    const playerSong = toPlayerSong(song)
    const isThisPlaying = isCurrentSong(playerSong) && isPlaying
    const displayLikes = liked ? song.likes + 1 : song.likes

    function handlePlay() {
        playSong(playerSong, queue)
    }

    async function handleShare() {
        const fallbackPath = `/song/${playerSong.id}`

        try {
            if (typeof window !== "undefined" && navigator.clipboard) {
                await navigator.clipboard.writeText(`${window.location.origin}${fallbackPath}`)
                setMessage("Song link copied.")
                return
            }
        } catch {
            // Fall through to status message.
        }

        setMessage("Share options will be connected later.")
    }

    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-[#08080a] pb-[calc(var(--app-bottom-player-height)+var(--app-mobile-tab-bar-height)+1rem)] text-sand lg:pb-[calc(var(--app-bottom-player-height)+2rem)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(227,122,44,0.25),transparent_28%),radial-gradient(circle_at_88%_8%,rgba(26,58,92,0.85),transparent_34%),linear-gradient(135deg,#08080a_0%,#10141b_42%,#08080a_100%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(90deg,rgba(237,227,211,0.36)_1px,transparent_1px),linear-gradient(rgba(237,227,211,0.28)_1px,transparent_1px)] [background-size:38px_38px]" />

            <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
                <Link
                    href="/feed"
                    className="inline-flex items-center gap-2 rounded-full border border-sand/12 bg-sand/[0.06] px-4 py-2 text-sm font-bold text-sand/80 transition hover:border-saffron/35 hover:bg-saffron/10 hover:text-saffron"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back to Discover
                </Link>

                <section className="mt-5 grid min-w-0 gap-6 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)] lg:items-center">
                    <CoverArtwork song={song} size="hero" />

                    <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                            <Badge>{song.dialect}</Badge>
                            <Badge>{song.genrePreset}</Badge>
                            <Badge tone={song.isPublic ? "orange" : "muted"}>
                                {song.isPublic ? (
                                    <Globe2 className="size-3.5" aria-hidden="true" />
                                ) : (
                                    <Lock className="size-3.5" aria-hidden="true" />
                                )}
                                {song.isPublic ? "Public" : "Private"}
                            </Badge>
                        </div>

                        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[0.98] text-sand sm:text-5xl lg:text-7xl">
                            {song.title}
                        </h1>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <Link
                                href={profilePathForCreator(song.creator)}
                                className="inline-flex items-center gap-2 rounded-full border border-sand/12 bg-sand/[0.06] py-1.5 pl-1.5 pr-4 text-sm font-black text-sand transition hover:border-saffron/35 hover:text-saffron"
                            >
                                <span className="size-8 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f2d1aa_0%,#e37a2c_36%,#2f8f9a_100%)]" />
                                {song.creator}
                            </Link>
                            <button
                                type="button"
                                aria-label={`Follow ${song.creator}`}
                                className="inline-flex h-10 items-center gap-2 rounded-full bg-sand/10 px-4 text-sm font-black text-sand transition hover:bg-saffron hover:text-sand"
                            >
                                <UserPlus className="size-4" aria-hidden="true" />
                                Follow
                            </button>
                        </div>

                        <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-sand/66 lg:text-lg">
                            {getSongDescription(song)}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-sand/60">
                            <Stat icon={<Clock3 className="size-4" />} label={song.duration} />
                            <Stat icon={<Headphones className="size-4" />} label={`${formatCount(song.plays)} plays`} />
                            <Stat icon={<Heart className="size-4" />} label={`${formatCount(displayLikes)} likes`} />
                            <Stat icon={<CalendarDays className="size-4" />} label={formatCreatedAt(song.createdAt)} />
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2.5">
                            <button
                                type="button"
                                onClick={handlePlay}
                                aria-label={`${isThisPlaying ? "Pause" : "Play"} ${song.title}`}
                                className="inline-flex h-12 items-center gap-2 rounded-full bg-saffron px-5 text-sm font-black text-sand shadow-[0_16px_42px_rgba(227,122,44,0.25)] transition hover:bg-terracotta"
                            >
                                {isThisPlaying ? (
                                    <Pause className="size-4 fill-current" aria-hidden="true" />
                                ) : (
                                    <Play className="size-4 fill-current" aria-hidden="true" />
                                )}
                                {isThisPlaying ? "Pause" : "Play"}
                            </button>
                            <ActionButton
                                ariaLabel={`${liked ? "Unlike" : "Like"} ${song.title}`}
                                active={liked}
                                onClick={() => setLiked((value) => !value)}
                                icon={<Heart className={`size-4 ${liked ? "fill-current" : ""}`} />}
                            >
                                Like
                            </ActionButton>
                            <ActionButton
                                ariaLabel={`${saved ? "Unsave" : "Save"} ${song.title}`}
                                active={saved}
                                onClick={() => {
                                    setSaved((value) => !value)
                                    setMessage(saved ? "Removed from saved songs." : "Saved to your library.")
                                }}
                                icon={<Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />}
                            >
                                Save
                            </ActionButton>
                            <ActionButton
                                ariaLabel={`Share ${song.title}`}
                                onClick={handleShare}
                                icon={<Share2 className="size-4" />}
                            >
                                Share
                            </ActionButton>
                            <Link
                                href="/create#composer"
                                aria-label={`Remix ${song.title}`}
                                className="inline-flex h-12 items-center gap-2 rounded-full border border-saffron/28 bg-saffron/10 px-4 text-sm font-black text-saffron transition hover:bg-saffron/15"
                            >
                                <RefreshCcw className="size-4" aria-hidden="true" />
                                Remix
                            </Link>
                        </div>

                        {/* Waveform - shown when song has audio */}
                        <div className="mt-6 w-full">
                            <AudioWaveform
                                audioUrl={song.audioUrl ?? null}
                                isPlaying={false}
                                height={80}
                                className="rounded-xl"
                            />
                        </div>

                        {message ? (
                            <p role="status" className="mt-4 rounded-2xl border border-saffron/25 bg-saffron/10 px-4 py-3 text-sm font-bold text-saffron">
                                {message}
                            </p>
                        ) : null}
                    </div>
                </section>

                <section className="mt-7 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="min-w-0 rounded-[1.5rem] border border-sand/12 bg-sand/[0.07] p-3 shadow-[0_22px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
                        <div className="rounded-[1.15rem] border border-sand/10 bg-[#111215]/72 p-4 sm:p-5">
                            <div role="tablist" aria-label="Song information" className="flex flex-wrap gap-2">
                                {(["lyrics", "prompt", "details"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTab === tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`h-10 rounded-full px-4 text-sm font-black capitalize transition ${
                                            activeTab === tab
                                                ? "bg-saffron text-sand"
                                                : "bg-sand/[0.07] text-sand/62 hover:bg-sand/10 hover:text-sand"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-5 min-h-56">
                                {activeTab === "lyrics" && (
                                    <TextPanel
                                        title="Lyrics"
                                        text={song.lyrics || "Lyrics are not available for this preview yet."}
                                    />
                                )}
                                {activeTab === "prompt" && (
                                    <TextPanel
                                        title="Prompt"
                                        text={song.prompt || "Prompt preview coming soon."}
                                    />
                                )}
                                {activeTab === "details" && (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <DetailCard label="Dialect" value={song.dialect} />
                                        <DetailCard label="Genre preset" value={song.genrePreset} />
                                        <DetailCard label="Instruments" value={song.instruments.join(", ")} />
                                        <DetailCard label="Visibility" value={song.isPublic ? "Public" : "Private"} />
                                        <DetailCard label="Duration" value={song.duration} />
                                        <DetailCard label="Plays" value={formatCount(song.plays)} />
                                        <DetailCard label="Likes" value={formatCount(displayLikes)} />
                                        <DetailCard label="Created" value={formatCreatedAt(song.createdAt)} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <aside className="grid min-w-0 gap-5">
                        <section className="rounded-[1.5rem] border border-sand/12 bg-sand/[0.07] p-3 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
                            <div className="rounded-[1.15rem] border border-sand/10 bg-[#111215]/72 p-4">
                                <CommentsThread songId={song.id} className="max-h-[28rem]" />
                            </div>
                        </section>
                        <div className="rounded-[1.5rem] border border-sand/12 bg-sand/[0.07] p-3 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
                            <div className="rounded-[1.15rem] border border-sand/10 bg-[#111215]/72 p-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-saffron" aria-hidden="true" />
                                    <h2 className="text-lg font-black text-sand">Related Songs</h2>
                                </div>
                                <div className="mt-4 grid gap-3">
                                    {relatedSongs.map((relatedSong) => (
                                        <RelatedSongCard
                                            key={relatedSong.id}
                                            song={relatedSong}
                                            queue={queue}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    )
}

function SongNotFound() {
    return (
        <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#08080a] px-4 pb-[calc(var(--app-bottom-player-height)+var(--app-mobile-tab-bar-height)+1rem)] text-sand lg:pb-[calc(var(--app-bottom-player-height)+2rem)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(227,122,44,0.22),transparent_30%),linear-gradient(135deg,#08080a,#10141b_52%,#08080a)]" />
            <section className="relative z-10 w-full max-w-lg rounded-[1.5rem] border border-sand/12 bg-sand/[0.07] p-3 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                <div className="rounded-[1.15rem] border border-sand/10 bg-[#111215]/76 px-5 py-8">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-saffron/12 text-saffron">
                        <Music2 className="size-7" aria-hidden="true" />
                    </div>
                    <h1 className="mt-5 text-3xl font-black text-sand">Song not found</h1>
                    <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-sand/58">
                        This track may have been removed or is not available.
                    </p>
                    <Link
                        href="/feed"
                        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-saffron px-5 text-sm font-black text-sand transition hover:bg-terracotta"
                    >
                        Back to Discover
                    </Link>
                </div>
            </section>
        </div>
    )
}

function CoverArtwork({ song, size }: { song: MockSong; size: "hero" | "card" }) {
    const sizeClass =
        size === "hero"
            ? "aspect-square w-full max-w-[420px] justify-self-center lg:justify-self-start"
            : "size-16"

    return (
        <div
            className={`relative overflow-hidden rounded-[1.6rem] border border-sand/12 bg-[#15171b] shadow-[0_28px_90px_rgba(0,0,0,0.42)] ${sizeClass}`}
            style={{ background: song.gradient }}
        >
            {song.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={song.coverImage}
                    alt={`${song.title} cover artwork`}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(event) => {
                        ;(event.currentTarget as HTMLImageElement).style.display = "none"
                    }}
                />
            ) : null}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(237,227,211,0.24),transparent_22%),linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.55))]" />
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(45deg,rgba(237,227,211,0.24)_1px,transparent_1px),linear-gradient(-45deg,rgba(227,122,44,0.24)_1px,transparent_1px)] [background-size:18px_18px]" />
            {!song.coverImage ? (
                <Music2 className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 text-sand/18" aria-hidden="true" />
            ) : null}
        </div>
    )
}

function Badge({
    children,
    tone = "muted",
}: {
    children: React.ReactNode
    tone?: "muted" | "orange"
}) {
    return (
        <span
            className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-black uppercase tracking-[0.14em] ${
                tone === "orange"
                    ? "border-saffron/35 bg-saffron/12 text-saffron"
                    : "border-sand/12 bg-sand/[0.07] text-sand/64"
            }`}
        >
            {children}
        </span>
    )
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-sand/10 bg-sand/[0.06] px-3 py-2">
            <span className="text-saffron" aria-hidden="true">{icon}</span>
            {label}
        </span>
    )
}

function ActionButton({
    active,
    ariaLabel,
    children,
    icon,
    onClick,
}: {
    active?: boolean
    ariaLabel: string
    children: React.ReactNode
    icon: React.ReactNode
    onClick: () => void
}) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            aria-pressed={active}
            onClick={onClick}
            className={`inline-flex h-12 items-center gap-2 rounded-full border px-4 text-sm font-black transition ${
                active
                    ? "border-saffron/40 bg-saffron/14 text-saffron"
                    : "border-sand/12 bg-sand/[0.06] text-sand hover:bg-sand/10"
            }`}
        >
            <span aria-hidden="true">{icon}</span>
            {children}
        </button>
    )
}

function TextPanel({ title, text }: { title: string; text: string }) {
    return (
        <article>
            <h2 className="text-xl font-black text-sand">{title}</h2>
            <p className="mt-4 whitespace-pre-line text-base font-semibold leading-8 text-sand/70">
                {text}
            </p>
        </article>
    )
}

function DetailCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-sand/10 bg-sand/[0.06] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sand/42">
                {label}
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-sand/82">{value}</p>
        </div>
    )
}

function RelatedSongCard({ song, queue }: { song: MockSong; queue: ReturnType<typeof toPlayerSong>[] }) {
    const { playSong, isCurrentSong, isPlaying } = usePlaySong()
    const playerSong = toPlayerSong(song)
    const isThisPlaying = isCurrentSong(playerSong) && isPlaying

    return (
        <article className="grid grid-cols-[4rem_minmax(0,1fr)_2.5rem] items-center gap-3 rounded-2xl border border-sand/10 bg-sand/[0.06] p-2.5">
            <Link
                href={`/song/${song.id}`}
                aria-label={`Open ${song.title}`}
                className="rounded-[1rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
                <CoverArtwork song={song} size="card" />
            </Link>
            <div className="min-w-0">
                <Link
                    href={`/song/${song.id}`}
                    className="block truncate text-sm font-black text-sand transition hover:text-saffron focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                >
                    {song.title}
                </Link>
                <Link
                    href={profilePathForCreator(song.creator)}
                    className="mt-1 inline-block truncate text-xs font-bold text-sand/48 transition hover:text-saffron focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                >
                    {song.creator}
                </Link>
                <p className="mt-1 flex items-center gap-2 text-[11px] font-bold text-sand/36">
                    <span>{formatCount(song.plays)} plays</span>
                    <span>{song.duration}</span>
                </p>
            </div>
            <button
                type="button"
                onClick={() => playSong(playerSong, queue)}
                aria-label={`${isThisPlaying ? "Pause" : "Play"} ${song.title}`}
                className="flex size-11 items-center justify-center rounded-full bg-sand/10 text-sand transition hover:bg-saffron hover:text-sand"
            >
                {isThisPlaying ? (
                    <Pause className="size-4 fill-current" aria-hidden="true" />
                ) : (
                    <Play className="size-4 fill-current" aria-hidden="true" />
                )}
            </button>
        </article>
    )
}
