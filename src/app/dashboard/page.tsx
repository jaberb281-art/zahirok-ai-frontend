"use client"

import type { ComponentType } from "react"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowRight,
    AudioWaveform,
    Bell,
    CalendarDays,
    Copy,
    Download,
    Drum,
    FileText,
    Mic2,
    MoreHorizontal,
    Music2,
    Pause,
    Pencil,
    PenLine,
    Play,
    Radio,
    Repeat2,
    Sparkles,
    Trash2,
    X,
} from "lucide-react"

import type { Song } from "@/lib/types"
import { getDemoImage } from "@/lib/demo-images"
import { DemoVideoPoster } from "@/components/media/demo-video"
import { usePlaySong } from "@/hooks/use-play-song"

type StudioActionKind = "lyrics" | "instrument" | "radio" | "remix" | "voice"

// Build a minimal playable Song from a dashboard item so play buttons can drive
// the existing global player (BottomPlayer + usePlaySong + player-store).
function toPlayableSong(input: { id: string; title: string; duration: string }): Song {
    return {
        id: input.id,
        title: input.title,
        prompt: "",
        genrePreset: "Soroz",
        instruments: ["Damboora", "Suroz"],
        lyrics: "",
        status: "completed",
        audioUrl: "/mock/audio-placeholder.mp3",
        mp3Url: "/mock/audio-placeholder.mp3",
        wavUrl: "/mock/audio-placeholder.wav",
        isPublic: false,
        createdAt: "2026-06-01T00:00:00.000Z",
        duration: input.duration,
        plays: 0,
        likes: 0,
        remixes: 0,
    }
}

type StudioAction = {
    title: string
    description: string
    href: string
    cta: string
    icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
    image: string
    kind: StudioActionKind
    waveform: number[]
}

type CapturedMoment = {
    id: string
    stationName: string
    duration: string
    href: string
    image: string
    tags: string[]
    waveform: number[]
}

type RecentWorkItem = {
    id: string
    title: string
    type: "Draft" | "Song" | "Capture"
    metadata: string
    duration: string
    /** ISO 8601 date string */
    createdAt: string
    href: string
    action: string
    image: string
    waveform: number[]
}

type StartingPoint = {
    title: string
    cue: string
    href: string
    image: string
    accent: string
    waveform: number[]
}

type DailySound = {
    name: string
    description: string
    detail: string
    href: string
    waveform: number[]
}

type WhatsNewItem = {
    date: string
    text: string
}

const HERO_IMAGE = "/hero/zahirok-hero-bg.png"

const DASHBOARD_USER = {
    creditsRemaining: 75,
    username: "jaberb281",
}

// Set to true to preview the first-time-user experience with mock data.
const MOCK_FIRST_TIME = false
const DASHBOARD_WEEK_START_ISO = "2026-06-02T00:00:00.000Z"

const WELCOME_DISMISSED_KEY = "zahirok-welcome-dismissed"
const WHATS_NEW_STORAGE_KEY = "zahirok-dashboard-whats-new-2026-06"

const WHATS_NEW_ITEMS: WhatsNewItem[] = [
    { date: "Jun 2026", text: "Voice Style mode now available" },
    { date: "Jun 2026", text: "Balochi instrument library expanded" },
    { date: "Jun 2026", text: "New Mood Starts: Coastal Dusk, Caravan Road" },
]

function readDashboardStorageFlag(key: string) {
    try {
        return window.localStorage.getItem(key) === "read"
    } catch {
        return false
    }
}

function writeDashboardStorageFlag(key: string) {
    try {
        window.localStorage.setItem(key, "read")
    } catch {
        // Ignore storage failures; the in-memory read state still updates.
    }
}

const DAILY_SOUNDS: DailySound[] = [
    {
        name: "Suroz",
        description: "A bowed fiddle from coastal Makran, known for its yearning melodic lines",
        detail: "Bowed spike fiddle",
        href: "/create?start=instrument&prompt=Suroz%20lead%20with%20coastal%20Makran%20melody%20and%20yearning%20Soroz%20phrasing",
        waveform: [26, 44, 32, 58, 39, 68, 45, 72, 34, 62, 50, 74],
    },
    {
        name: "Benju",
        description: "A plucked string instrument for rhythmic accompaniment",
        detail: "Plucked zither texture",
        href: "/create?start=instrument&prompt=Benju%20texture%20with%20bright%20rhythmic%20accompaniment%20and%20coastal%20folk%20pulse",
        waveform: [42, 34, 56, 48, 62, 38, 70, 46, 59, 52, 64, 44],
    },
    {
        name: "Dambora",
        description: "A two-stringed lute, the voice of Balochi storytelling",
        detail: "Two-stringed lute",
        href: "/create?start=instrument&prompt=Dambora%20storytelling%20pulse%20with%20warm%20Balochi%20folk%20phrasing",
        waveform: [36, 52, 40, 64, 45, 72, 49, 66, 43, 58, 51, 69],
    },
    {
        name: "Duholl",
        description: "A double-headed drum for celebrations and gatherings",
        detail: "Celebration drum",
        href: "/create?start=instrument&prompt=Duholl%20celebration%20rhythm%20with%20wedding%20energy%20and%20group%20chorus",
        waveform: [58, 72, 48, 80, 62, 86, 55, 78, 66, 84, 59, 76],
    },
    {
        name: "Rabab",
        description: "A deep-bodied lute with resonant sympathetic strings",
        detail: "Resonant lute",
        href: "/create?start=instrument&prompt=Rabab%20resonant%20lute%20melody%20with%20deep%20body%20and%20cinematic%20Soroz%20space",
        waveform: [28, 46, 35, 61, 44, 69, 39, 65, 50, 73, 42, 58],
    },
    {
        name: "Makkuran vocal",
        description: "The coastal singing tradition of the Makran belt",
        detail: "Coastal vocal style",
        href: "/create?start=voice&prompt=Makkuran%20vocal%20style%20with%20coastal%20phrasing%20and%20soft%20Soroz%20melody",
        waveform: [31, 55, 38, 68, 47, 76, 52, 70, 43, 63, 57, 79],
    },
    {
        name: "Tanburag",
        description: "A long-necked fretless lute for drone and melody",
        detail: "Drone and melody",
        href: "/create?start=instrument&prompt=Tanburag%20drone%20and%20melody%20with%20minimal%20folk%20arrangement",
        waveform: [24, 38, 29, 52, 34, 57, 31, 61, 36, 54, 41, 66],
    },
]

const QUICK_START: StudioAction[] = [
    {
        title: "Write Lyrics",
        description: "Start from a verse, hook, or full song idea.",
        href: "/create?start=lyrics",
        cta: "Write now",
        icon: PenLine,
        image: getDemoImage(0),
        kind: "lyrics",
        waveform: [18, 32, 48, 24, 55, 36, 44, 27, 62, 31, 52, 22],
    },
    {
        title: "Tune Radio",
        description: "Find a live stream and capture the best 30 seconds.",
        href: "/radio",
        cta: "Open radio",
        icon: Radio,
        image: getDemoImage(1),
        kind: "radio",
        waveform: [26, 44, 68, 31, 72, 55, 78, 36, 65, 42, 74, 51],
    },
    {
        title: "Start with Instrument",
        description: "Build around a rhythm, texture, or sound.",
        href: "/create?start=instrument",
        cta: "Choose sound",
        icon: Drum,
        image: getDemoImage(2),
        kind: "instrument",
        waveform: [42, 64, 36, 58, 74, 48, 68, 33, 52, 71, 44, 59],
    },
    {
        title: "Remix a Song",
        description: "Turn an existing idea into a new direction.",
        href: "/create?start=inspo",
        cta: "Start remix",
        icon: Repeat2,
        image: getDemoImage(3),
        kind: "remix",
        waveform: [57, 24, 70, 42, 61, 33, 79, 46, 54, 66, 29, 73],
    },
    {
        title: "Voice Style",
        description: "Define a vocal identity, then build around it.",
        href: "/create?start=voice",
        cta: "Set the voice",
        icon: Mic2,
        image: getDemoImage(4),
        kind: "voice",
        waveform: [34, 52, 28, 61, 45, 70, 38, 58, 49, 66, 31, 55],
    },
]

const LAST_CAPTURED: CapturedMoment = {
    id: "capture-desert-night",
    stationName: "Desert Night Radio",
    duration: "0:30",
    href: "/create?capture=capture-desert-night&prompt=Turn%20Desert%20Night%20Radio%2030s%20capture%20into%20a%20complete%20song",
    image: getDemoImage(5),
    tags: ["Calm", "Dambora"],
    waveform: [24, 44, 35, 62, 48, 71, 40, 58, 76, 51, 69, 37, 55, 43, 64, 31, 59, 46],
}

const RECENT_WORK: RecentWorkItem[] = [
    {
        id: "draft-wedding-hook-idea",
        title: "Wedding hook idea",
        type: "Draft",
        metadata: "Verse sketch",
        duration: "draft",
        createdAt: "2026-06-08T22:00:00.000Z",
        href: "/create?draft=wedding-hook-idea",
        action: "Continue",
        image: getDemoImage(6),
        waveform: [20, 30, 25, 42, 32, 46, 28, 38, 34, 48],
    },
    {
        id: "song-long-road-demo",
        title: "Long Road demo",
        type: "Song",
        metadata: "Dambora, low voice",
        duration: "3:42",
        createdAt: "2026-06-07T22:00:00.000Z",
        href: "/library",
        action: "Open",
        image: getDemoImage(7),
        waveform: [44, 62, 38, 70, 55, 66, 47, 73, 52, 61],
    },
    {
        id: "capture-desert-night-30s",
        title: "Desert Night 30s",
        type: "Capture",
        metadata: "Calm radio moment",
        duration: "0:30",
        createdAt: "2026-05-28T00:00:00.000Z",
        href: "/create?capture=capture-desert-night-30s&prompt=Turn%20Desert%20Night%2030s%20capture%20into%20a%20song",
        action: "Turn into song",
        image: getDemoImage(8),
        waveform: [30, 58, 42, 69, 51, 74, 36, 63, 47, 71],
    },
]

const STARTING_POINTS: StartingPoint[] = [
    {
        title: "Deep Focus",
        cue: "quiet writing texture",
        href: "/create?prompt=Deep%20Focus%20ambient%20quiet%20writing%20texture%20with%20lo-fi%20Dambora",
        image: getDemoImage(0),
        accent: "from-[#24384a]/55 via-[#11100f]/80 to-[#0b0d10]",
        waveform: [24, 40, 31, 48, 35, 45, 28, 42],
    },
    {
        title: "Heartbreak",
        cue: "soft vocal ache",
        href: "/create?prompt=Heartbreak%20song%20with%20warm%20strings%20and%20a%20low%20voice",
        image: getDemoImage(1),
        accent: "from-[#56293b]/52 via-[#151014]/82 to-[#0c090b]",
        waveform: [52, 31, 59, 28, 66, 37, 49, 24],
    },
    {
        title: "Celebration",
        cue: "wedding energy",
        href: "/create?prompt=Celebration%20song%20with%20dohol%20rhythm%20and%20bright%20chorus",
        image: getDemoImage(2),
        accent: "from-[#7a451c]/58 via-[#18110b]/84 to-[#0e0a07]",
        waveform: [62, 46, 74, 58, 81, 51, 70, 64],
    },
    {
        title: "Coastal Dusk",
        cue: "Makran shoreline, Suroz melody",
        href: "/create?prompt=Coastal%20Dusk%20with%20Makran%20shoreline%20ambience%20and%20a%20yearning%20Suroz%20melody",
        image: getDemoImage(3),
        accent: "from-[#16475a]/52 via-[#101516]/84 to-[#080b0c]",
        waveform: [35, 52, 43, 68, 39, 61, 49, 72],
    },
    {
        title: "Caravan Road",
        cue: "Dambora rhythm, desert warmth",
        href: "/create?prompt=Caravan%20Road%20with%20Dambora%20rhythm%20desert%20warmth%20and%20steady%20travel%20pulse",
        image: getDemoImage(4),
        accent: "from-[#6a3c19]/54 via-[#16100c]/84 to-[#0b0806]",
        waveform: [42, 58, 36, 65, 48, 72, 39, 60],
    },
    {
        title: "Monsoon Arrival",
        cue: "rain percussion, building anticipation",
        href: "/create?prompt=Monsoon%20Arrival%20with%20rain%20percussion%20building%20anticipation%20and%20wide%20coastal%20vocals",
        image: getDemoImage(5),
        accent: "from-[#2b5061]/54 via-[#111417]/84 to-[#080a0d]",
        waveform: [28, 46, 62, 39, 72, 54, 82, 61],
    },
    {
        title: "Night Prayer",
        cue: "devotional calm, single voice",
        href: "/create?prompt=Night%20Prayer%20with%20devotional%20calm%20single%20voice%20and%20soft%20Dambora%20drone",
        image: getDemoImage(6),
        accent: "from-[#343052]/50 via-[#121017]/84 to-[#09080d]",
        waveform: [26, 34, 52, 31, 48, 29, 56, 38],
    },
    {
        title: "Festival Fire",
        cue: "Benju drums, group energy",
        href: "/create?prompt=Festival%20Fire%20with%20Benju%20drums%20group%20energy%20and%20bright%20wedding%20chorus",
        image: getDemoImage(7),
        accent: "from-[#7c251c]/56 via-[#1b100c]/84 to-[#0f0705]",
        waveform: [58, 76, 51, 84, 63, 79, 72, 88],
    },
]

export default function DashboardPage() {
    const [recentItems, setRecentItems] = useState<RecentWorkItem[]>(RECENT_WORK)
    // Start as true (hidden) to avoid flash; useEffect sets false if not yet dismissed.
    const [welcomeDismissed, setWelcomeDismissed] = useState(true)
    const [toast, setToast] = useState("")
    const [whatsNewOpen, setWhatsNewOpen] = useState(false)
    const [whatsNewRead, setWhatsNewRead] = useState(false)
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const capturedMoments = MOCK_FIRST_TIME ? [] : [LAST_CAPTURED]

    useEffect(
        () => () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        },
        [],
    )

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setWhatsNewRead(readDashboardStorageFlag(WHATS_NEW_STORAGE_KEY))
            // Show welcome banner only once — hide permanently after first dismiss.
            setWelcomeDismissed(readDashboardStorageFlag(WELCOME_DISMISSED_KEY))
        }, 0)

        return () => window.clearTimeout(timeoutId)
    }, [])

    function notify(message: string) {
        setToast(message)
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(""), 2800)
    }

    function handleRename(id: string, title: string) {
        setRecentItems((items) =>
            items.map((item) => (item.id === id ? { ...item, title } : item)),
        )
    }

    function handleDelete(id: string) {
        setRecentItems((items) => items.filter((item) => item.id !== id))
    }

    function handleDismissWelcome() {
        setWelcomeDismissed(true)
        writeDashboardStorageFlag(WELCOME_DISMISSED_KEY)
    }

    function handleOpenWhatsNew() {
        setWhatsNewOpen(true)
        setWhatsNewRead(true)
        writeDashboardStorageFlag(WHATS_NEW_STORAGE_KEY)
    }

    const mostRecentDraft = MOCK_FIRST_TIME ? null : (recentItems.find((item) => item.type === "Draft") ?? null)
    const mostRecentCapture = capturedMoments[0] ?? null
    const dashboardStats = {
        creditsRemaining: DASHBOARD_USER.creditsRemaining,
        draftsInProgress: recentItems.filter((item) => item.type === "Draft").length,
        songsCreated: recentItems.filter((item) => item.type === "Song").length,
        songsThisWeek: recentItems.filter(
            (item) => item.type === "Song" && item.createdAt >= DASHBOARD_WEEK_START_ISO,
        ).length,
    }
    const isFirstTimeUser =
        MOCK_FIRST_TIME || (recentItems.length === 0 && capturedMoments.length === 0)

    return (
        <div className="relative min-h-dvh overflow-x-hidden bg-[#090909] text-sand">
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_6%,rgba(227,122,44,0.13),transparent_31%),radial-gradient(circle_at_78%_12%,rgba(42,67,86,0.26),transparent_30%),linear-gradient(180deg,#11100f_0%,#090909_58%,#080808_100%)]"
                aria-hidden={true}
            />
            <div className="pointer-events-none absolute inset-0 bg-balochi-pattern-faint opacity-30" aria-hidden={true} />

            <main className="relative z-10 mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-4 pb-[calc(var(--app-bottom-safe-area)+1.25rem)] pt-5 sm:px-6 lg:px-8 lg:pb-[calc(var(--app-bottom-player-height)+1.5rem)]">
                {isFirstTimeUser && !welcomeDismissed && (
                    <WelcomeBanner onDismiss={handleDismissWelcome} />
                )}

                <HeroSection
                    draftHref={mostRecentDraft?.href ?? null}
                    onNotify={notify}
                    onOpenWhatsNew={handleOpenWhatsNew}
                    showWhatsNewBadge={!whatsNewRead}
                />

                <GreetingStatsRow
                    isFirstTime={isFirstTimeUser}
                    stats={dashboardStats}
                    username={DASHBOARD_USER.username}
                />

                {mostRecentCapture && <CaptureCard moment={mostRecentCapture} />}

                <section aria-labelledby="quick-start-title" className="flex flex-col gap-3">
                    <SectionHeader
                        id="quick-start-title"
                        eyebrow="Quick Start"
                        title="Choose your first sound"
                        description="Start with lyrics, a voice, instruments, radio, or a remix."
                    />
                    {/* Primary row */}
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                        <QuickStartCard action={QUICK_START[0]} primary={true} />
                        <QuickStartCard action={QUICK_START[1]} primary={true} />
                    </div>
                    {/* Secondary row */}
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                        <QuickStartCard action={QUICK_START[2]} primary={false} />
                        <QuickStartCard action={QUICK_START[3]} primary={false} />
                        <QuickStartCard action={QUICK_START[4]} primary={false} />
                    </div>
                </section>

                <TodaysSoundCard />

                <RecentWorkPanel
                    items={recentItems}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onNotify={notify}
                />

                <TryFirstPanel points={STARTING_POINTS} />
            </main>

            <WhatsNewPanel
                isOpen={whatsNewOpen}
                items={WHATS_NEW_ITEMS}
                onClose={() => setWhatsNewOpen(false)}
            />

            <DashboardToast message={toast} />
        </div>
    )
}

function formatRelativeDate(isoString: string): string {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60_000)
    const diffHours = Math.floor(diffMs / 3_600_000)
    const diffDays = Math.floor(diffMs / 86_400_000)

    if (diffMins < 60) return diffMins <= 1 ? "Just now" : `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// Locale- and timezone-independent (UTC components) so the server and client
// render an identical string — `Intl.DateTimeFormat("en", …)` resolved to
// different variants on Node vs the browser and caused a hydration mismatch.
function formatCreatedAtTitle(isoString: string): string {
    const date = new Date(isoString)
    const pad = (value: number) => value.toString().padStart(2, "0")
    return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}, ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
}

function getLocalGreeting() {
    const hour = new Date().getHours()

    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
}

function WelcomeBanner({ onDismiss }: { onDismiss: () => void }) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-saffron/18 bg-saffron/[0.07] px-4 py-3 shadow-[0_14px_44px_rgba(0,0,0,0.18)] sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white">Welcome to Soroz</p>
                <p className="mt-0.5 text-sm font-semibold text-sand/58">
                    Start by choosing a sound below, or jump straight into Create Song.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Link
                    href="/create"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-saffron px-3 text-xs font-black text-[#171210] transition hover:bg-[#f0a23b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                >
                    Create Song
                    <ArrowRight className="size-3.5" aria-hidden={true} />
                </Link>
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss welcome"
                    className="inline-flex size-9 items-center justify-center rounded-lg text-sand/45 transition hover:bg-white/[0.06] hover:text-sand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                >
                    <X className="size-4" aria-hidden={true} />
                </button>
            </div>
        </div>
    )
}

function GreetingStatsRow({
    isFirstTime,
    stats,
    username,
}: {
    isFirstTime: boolean
    stats: {
        creditsRemaining: number
        draftsInProgress: number
        songsCreated: number
        songsThisWeek: number
    }
    username: string
}) {
    const [greeting, setGreeting] = useState("")

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setGreeting(isFirstTime ? "Welcome to Soroz" : getLocalGreeting())
        }, 0)

        return () => window.clearTimeout(timeoutId)
    }, [isFirstTime])

    return (
        <section
            aria-label="Dashboard summary"
            className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
            <div>
                <p className="text-lg font-black text-white sm:text-xl">
                    {greeting ? `${greeting}, ${username}` : " "}
                </p>
                <p className="mt-1 text-sm font-semibold text-sand/52">
                    {isFirstTime
                        ? "Choose a sound below to create your first Makkuran track."
                        : `You have ${stats.creditsRemaining} credits remaining`}
                </p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-end sm:overflow-visible sm:pb-0">
                <DashboardStatPill
                    icon={Music2}
                    label="Songs created"
                    value={stats.songsCreated}
                />
                <DashboardStatPill
                    icon={Sparkles}
                    label="Credits remaining"
                    value={stats.creditsRemaining}
                />
                <DashboardStatPill
                    icon={FileText}
                    label="Drafts in progress"
                    value={stats.draftsInProgress}
                />
                <DashboardStatPill
                    icon={CalendarDays}
                    label="This week"
                    value={stats.songsThisWeek}
                />
            </div>
        </section>
    )
}

function DashboardStatPill({
    icon,
    label,
    value,
}: {
    icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
    label: string
    value: number
}) {
    const Icon = icon

    return (
        <span className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.045] px-3 text-xs font-black text-sand/72">
            <Icon className="size-3.5 text-saffron" aria-hidden={true} />
            <span className="tabular-nums text-white">{value}</span>
            <span className="text-sand/48">{label}</span>
        </span>
    )
}

function WhatsNewPanel({
    isOpen,
    items,
    onClose,
}: {
    isOpen: boolean
    items: WhatsNewItem[]
    onClose: () => void
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-x-0 top-4 z-[130] flex justify-center px-4 sm:top-6">
            <div
                role="dialog"
                aria-modal="false"
                aria-labelledby="whats-new-title"
                className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#111113]/96 p-4 text-sand shadow-[0_24px_72px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            >
                <div className="flex items-start gap-3">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-saffron/20 bg-saffron/[0.08] text-saffron">
                        <Bell className="size-4" aria-hidden={true} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 id="whats-new-title" className="text-sm font-black text-white">
                            What&apos;s new
                        </h2>
                        <div className="mt-3 grid gap-2">
                            {items.map((item) => (
                                <div key={`${item.date}-${item.text}`} className="rounded-xl bg-white/[0.04] px-3 py-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-saffron/70">
                                        {item.date}
                                    </p>
                                    <p className="mt-0.5 text-sm font-semibold text-sand/76">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close what's new"
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-sand/45 transition hover:bg-white/[0.06] hover:text-sand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                    >
                        <X className="size-4" aria-hidden={true} />
                    </button>
                </div>
            </div>
        </div>
    )
}

function HeroSection({
    draftHref,
    onOpenWhatsNew,
    onNotify,
    showWhatsNewBadge,
}: {
    draftHref: string | null
    onOpenWhatsNew: () => void
    onNotify: (message: string) => void
    showWhatsNewBadge: boolean
}) {
    const router = useRouter()

    function handleContinueDraft() {
        if (draftHref) {
            router.push(draftHref)
        } else {
            onNotify("No drafts yet — create your first song!")
        }
    }

    return (
        <section
            aria-labelledby="studio-home-title"
            className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#141211]/88 shadow-[0_30px_96px_rgba(0,0,0,0.36)]"
        >
            <div
                className="absolute inset-0 bg-cover bg-center opacity-[0.22] mix-blend-screen"
                style={{ backgroundImage: `url(${HERO_IMAGE})` }}
                aria-hidden={true}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,9,0.95)_0%,rgba(9,9,9,0.82)_45%,rgba(9,9,9,0.52)_100%)]" aria-hidden={true} />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-saffron/45 to-transparent" aria-hidden={true} />
            <button
                type="button"
                onClick={onOpenWhatsNew}
                className="absolute right-4 top-4 z-20 inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.1] bg-black/26 px-3 text-xs font-black text-sand/76 backdrop-blur-sm transition hover:border-saffron/24 hover:text-saffron focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
                <Bell className="size-3.5 text-saffron" aria-hidden={true} />
                What&apos;s new
                {showWhatsNewBadge && (
                    <span className="rounded-full bg-saffron px-1.5 py-0.5 text-[10px] font-black uppercase leading-none text-[#171210]">
                        New
                    </span>
                )}
            </button>

            <div className="relative z-10 grid gap-6 p-5 sm:p-6 lg:grid-cols-[2fr_1fr] lg:p-8">
                <div className="flex min-w-0 flex-col justify-between gap-7">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-saffron/18 bg-saffron/[0.07] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-saffron/90">
                            <Sparkles className="size-3.5" aria-hidden={true} />
                            Studio Launchpad
                        </p>
                        <h1
                            id="studio-home-title"
                            className="mt-5 max-w-3xl text-3xl font-black leading-[1.08] tracking-normal text-white sm:text-[2.35rem] lg:text-[2.85rem]"
                        >
                            Create songs from lyrics, instruments, and captured moments.
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-sand/66 sm:text-base sm:leading-7">
                            Start with words, tune a live stream, or continue a sound you already found.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <HeroAction href="/create" icon={AudioWaveform} label="Create Song" primary />
                        <Link
                            href="/radio"
                            className="text-sm text-sand/50 underline-offset-2 transition-colors hover:text-sand/80 hover:underline"
                        >
                            Open Radio
                        </Link>
                        <button
                            type="button"
                            onClick={handleContinueDraft}
                            className="text-sm text-sand/50 underline-offset-2 transition-colors hover:text-sand/80 hover:underline"
                        >
                            Continue Draft
                        </button>
                    </div>
                </div>

                <AmbientWaveform />
            </div>
        </section>
    )
}

function AmbientWaveform() {
    const router = useRouter()

    return (
        <button
            type="button"
            onClick={() => router.push("/radio")}
            aria-label="Open The Drift radio"
            className="group relative flex min-h-[200px] w-full cursor-pointer items-end overflow-hidden rounded-xl border border-white/[0.08] bg-[#0e0d0d]/80 p-6 text-left transition hover:border-saffron/24 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron lg:min-h-[280px]"
        >
            <span className="absolute left-5 top-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-sand/30">
                Live feed
                <span className="inline-block size-1.5 rounded-full bg-saffron/60 animate-pulse" aria-hidden={true} />
            </span>
            <svg width="100%" height="72" preserveAspectRatio="none" aria-hidden="true">
                <rect x="0%" y={72 - 18} width="2" height="18" rx="1" fill="rgba(227,122,44,0.35)" />
                <rect x="3%" y={72 - 32} width="2" height="32" rx="1" fill="rgba(227,122,44,0.5)" />
                <rect x="6%" y={72 - 14} width="2" height="14" rx="1" fill="rgba(227,122,44,0.3)" />
                <rect x="9%" y={72 - 44} width="2" height="44" rx="1" fill="rgba(227,122,44,0.6)" />
                <rect x="12%" y={72 - 24} width="2" height="24" rx="1" fill="rgba(227,122,44,0.4)" />
                <rect x="15%" y={72 - 52} width="2" height="52" rx="1" fill="rgba(227,122,44,0.65)" />
                <rect x="18%" y={72 - 16} width="2" height="16" rx="1" fill="rgba(227,122,44,0.3)" />
                <rect x="21%" y={72 - 38} width="2" height="38" rx="1" fill="rgba(227,122,44,0.55)" />
                <rect x="24%" y={72 - 28} width="2" height="28" rx="1" fill="rgba(227,122,44,0.45)" />
                <rect x="27%" y={72 - 60} width="2" height="60" rx="1" fill="rgba(227,122,44,0.7)" />
                <rect x="30%" y={72 - 12} width="2" height="12" rx="1" fill="rgba(227,122,44,0.28)" />
                <rect x="33%" y={72 - 42} width="2" height="42" rx="1" fill="rgba(227,122,44,0.58)" />
                <rect x="36%" y={72 - 22} width="2" height="22" rx="1" fill="rgba(227,122,44,0.38)" />
                <rect x="39%" y={72 - 56} width="2" height="56" rx="1" fill="rgba(227,122,44,0.68)" />
                <rect x="42%" y={72 - 18} width="2" height="18" rx="1" fill="rgba(227,122,44,0.33)" />
                <rect x="45%" y={72 - 48} width="2" height="48" rx="1" fill="rgba(227,122,44,0.62)" />
                <rect x="48%" y={72 - 30} width="2" height="30" rx="1" fill="rgba(227,122,44,0.48)" />
                <rect x="51%" y={72 - 64} width="2" height="64" rx="1" fill="rgba(227,122,44,0.72)" />
                <rect x="54%" y={72 - 20} width="2" height="20" rx="1" fill="rgba(227,122,44,0.36)" />
                <rect x="57%" y={72 - 46} width="2" height="46" rx="1" fill="rgba(227,122,44,0.6)" />
                <rect x="60%" y={72 - 26} width="2" height="26" rx="1" fill="rgba(227,122,44,0.42)" />
                <rect x="63%" y={72 - 58} width="2" height="58" rx="1" fill="rgba(227,122,44,0.68)" />
                <rect x="66%" y={72 - 14} width="2" height="14" rx="1" fill="rgba(227,122,44,0.3)" />
                <rect x="69%" y={72 - 40} width="2" height="40" rx="1" fill="rgba(227,122,44,0.56)" />
                <rect x="72%" y={72 - 32} width="2" height="32" rx="1" fill="rgba(227,122,44,0.5)" />
                <rect x="75%" y={72 - 54} width="2" height="54" rx="1" fill="rgba(227,122,44,0.66)" />
                <rect x="78%" y={72 - 16} width="2" height="16" rx="1" fill="rgba(227,122,44,0.32)" />
                <rect x="81%" y={72 - 44} width="2" height="44" rx="1" fill="rgba(227,122,44,0.6)" />
                <rect x="84%" y={72 - 24} width="2" height="24" rx="1" fill="rgba(227,122,44,0.4)" />
                <rect x="87%" y={72 - 62} width="2" height="62" rx="1" fill="rgba(227,122,44,0.7)" />
                <rect x="90%" y={72 - 18} width="2" height="18" rx="1" fill="rgba(227,122,44,0.34)" />
                <rect x="93%" y={72 - 38} width="2" height="38" rx="1" fill="rgba(227,122,44,0.54)" />
                <rect x="96%" y={72 - 28} width="2" height="28" rx="1" fill="rgba(227,122,44,0.44)" />
                <rect x="99%" y={72 - 50} width="2" height="50" rx="1" fill="rgba(227,122,44,0.63)" />
            </svg>
            <span className="absolute bottom-4 left-5 inline-flex h-9 items-center gap-2 rounded-full border border-saffron/20 bg-black/30 px-3 text-xs font-black text-saffron backdrop-blur-sm transition group-hover:border-saffron/40 group-hover:bg-saffron/10">
                <Play className="size-3.5 fill-current" aria-hidden={true} />
                Open The Drift
            </span>
        </button>
    )
}

function SectionHeader({
    description,
    eyebrow,
    id,
    title,
}: {
    description: string
    eyebrow: string
    id?: string
    title: string
}) {
    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p id={id} className="text-xs font-black uppercase tracking-[0.16em] text-saffron/78">
                    {eyebrow}
                </p>
                <h2 className="mt-1 text-xl font-black tracking-normal text-white sm:text-2xl">{title}</h2>
            </div>
            <p className="max-w-md text-sm font-semibold leading-6 text-sand/48">{description}</p>
        </div>
    )
}

function QuickStartCard({ action, primary }: { action: StudioAction; primary?: boolean }) {
    const Icon = action.icon
    const sizing = primary ? "min-h-[240px] border-white/[0.14]" : "min-h-[160px] border-white/[0.05]"

    return (
        <Link
            href={action.href}
            className={`group relative ${sizing} overflow-hidden rounded-xl border bg-[#141211]/78 shadow-[0_14px_44px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-saffron/28 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${quickStartChrome(action.kind)}`}
        >
            <div className="relative h-24 overflow-hidden">
                <DemoVideoPoster
                    src={action.image}
                    className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-[0.82]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/12 via-black/22 to-[#141211]" aria-hidden={true} />
                <QuickStartVisual kind={action.kind} waveform={action.waveform} />
            </div>
            <div className="relative z-10 p-3.5 pt-0">
                <div className="flex items-start gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.05] text-saffron">
                        <Icon className="size-[18px]" aria-hidden={true} />
                    </span>
                    <div className="min-w-0">
                        <h3 className="text-base font-black leading-tight text-white">{action.title}</h3>
                        <p className="mt-1.5 text-sm font-semibold leading-5 text-sand/56">{action.description}</p>
                    </div>
                </div>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-black text-saffron/86 transition group-hover:text-saffron">
                    {action.cta}
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden={true} />
                </span>
            </div>
        </Link>
    )
}

function CaptureCard({ moment }: { moment: CapturedMoment }) {
    const { playSong, isCurrentSong, isPlaying } = usePlaySong()
    const song = toPlayableSong({
        id: moment.id,
        title: moment.stationName,
        duration: moment.duration,
    })
    const playing = isCurrentSong(song) && isPlaying

    return (
        <section
            aria-labelledby="capture-card-title"
            className="relative overflow-hidden rounded-2xl border border-saffron/20 bg-[#17120f]/92 shadow-[0_24px_82px_rgba(0,0,0,0.34)]"
        >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-saffron/60 to-transparent" aria-hidden={true} />
            <div className="grid min-h-[340px] lg:grid-cols-[0.88fr_1.12fr]">
                <div className="relative min-h-[220px] overflow-hidden lg:min-h-0">
                    <DemoVideoPoster
                        src={moment.image}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#17120f] via-black/12 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/12 lg:to-[#17120f]" aria-hidden={true} />
                    <button
                        type="button"
                        onClick={() => playSong(song)}
                        aria-label={`${playing ? "Pause" : "Play"} ${moment.stationName}`}
                        aria-pressed={playing}
                        className="absolute bottom-4 left-4 inline-flex size-14 items-center justify-center rounded-full bg-saffron text-[#171210] shadow-[0_18px_42px_rgba(0,0,0,0.42)] transition hover:bg-[#f0a23b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                    >
                        {playing ? (
                            <Pause className="size-6 fill-current" aria-hidden={true} />
                        ) : (
                            <Play className="ml-0.5 size-6 fill-current" aria-hidden={true} />
                        )}
                    </button>
                </div>

                <div className="relative z-10 flex flex-col justify-center p-5 sm:p-6">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron/84">Continue from capture</p>
                    <h2 id="capture-card-title" className="mt-2 text-2xl font-black text-white sm:text-3xl">Desert Night Radio</h2>
                    <p className="mt-2 text-sm font-bold text-sand/62">30s captured from the live stream</p>

                    <div className="mt-6">
                        <div className={playing ? "animate-pulse" : ""}>
                            <WaveformStrip bars={moment.waveform} tone="warm" />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.12em] text-sand/38">
                            <span>0:00</span>
                            <span>{moment.duration}</span>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {moment.tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-saffron/20 bg-saffron/[0.09] px-2.5 py-1 text-xs font-black text-saffron/90">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <Link
                        href={moment.href}
                        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-saffron px-3 text-sm font-black text-[#171210] transition hover:bg-[#f0a23b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron sm:w-fit sm:px-5"
                    >
                        Turn into song
                        <ArrowRight className="size-4" aria-hidden={true} />
                    </Link>
                </div>
            </div>
        </section>
    )
}

function RecentWorkPanel({
    items,
    onRename,
    onDelete,
    onNotify,
}: {
    items: RecentWorkItem[]
    onRename: (id: string, title: string) => void
    onDelete: (id: string) => void
    onNotify: (message: string) => void
}) {
    const visibleItems = items.slice(0, 5)

    return (
        <section
            aria-labelledby="recent-work-title"
            className="rounded-xl border border-white/[0.08] bg-[#131211]/76 p-4 shadow-[0_14px_44px_rgba(0,0,0,0.18)]"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 id="recent-work-title" className="text-xl font-black text-white">Recent work</h2>
                    <p className="mt-1 text-sm font-semibold text-sand/48">Songs, captures, and drafts in motion.</p>
                </div>
                {items.length > 0 && (
                    <Link
                        href="/library"
                        className="hidden h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-black text-sand/62 transition hover:border-saffron/24 hover:text-saffron focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron sm:inline-flex"
                    >
                        My Studio
                        <ArrowRight className="size-3.5" aria-hidden={true} />
                    </Link>
                )}
            </div>

            {visibleItems.length === 0 ? (
                <div className="mt-4 flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.015] px-6 py-12 text-center">
                    <span className="flex size-14 items-center justify-center rounded-2xl border border-saffron/20 bg-saffron/[0.08] text-saffron">
                        <AudioWaveform className="size-7" aria-hidden={true} />
                    </span>
                    <p className="mt-5 text-base font-black text-white">Your studio is empty</p>
                    <p className="mt-2 max-w-xs text-sm font-semibold text-sand/45">
                        Create your first song and it&apos;ll show up here.
                    </p>
                    <Link
                        href="/create"
                        className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-saffron px-5 text-sm font-black text-[#171210] shadow-[0_12px_30px_rgba(227,122,44,0.2)] transition hover:bg-[#f0a23b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                    >
                        Create your first song
                        <ArrowRight className="size-4" aria-hidden={true} />
                    </Link>
                </div>
            ) : (
                <div className="mt-4 grid gap-2">
                    {visibleItems.map((item) => (
                        <RecentWorkTrack
                            key={item.id}
                            item={item}
                            onRename={onRename}
                            onDelete={onDelete}
                            onNotify={onNotify}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

function TryFirstPanel({ points }: { points: StartingPoint[] }) {
    return (
        <section aria-labelledby="try-first-title">
            <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron/72">Try first</p>
                    <h2 id="try-first-title" className="mt-1 text-lg font-black text-white">Mood starts</h2>
                </div>
                <p className="hidden max-w-sm text-sm font-semibold text-sand/42 sm:block">
                    Quick sound worlds with their own color and motion.
                </p>
            </div>
            <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {points.map((point) => (
                    <MoodTile key={point.title} point={point} />
                ))}
            </div>
        </section>
    )
}

function TodaysSoundCard() {
    const [dayIndex, setDayIndex] = useState(0)

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDayIndex(new Date().getDate() % DAILY_SOUNDS.length)
        }, 0)

        return () => window.clearTimeout(timeoutId)
    }, [])

    const sound = DAILY_SOUNDS[dayIndex]
    const { playSong, isCurrentSong, isPlaying } = usePlaySong()
    const soundSong = toPlayableSong({
        id: `today-sound-${sound.name.toLowerCase().replace(/\s+/g, "-")}`,
        title: `Today: the ${sound.name}`,
        duration: "0:15",
    })
    const playing = isCurrentSong(soundSong) && isPlaying

    return (
        <section
            aria-labelledby="todays-sound-title"
            className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#131211]/76 shadow-[0_14px_44px_rgba(0,0,0,0.18)]"
        >
            <div className="grid gap-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                <div className="flex items-center gap-3">
                    <span className="relative inline-flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-saffron/20 bg-saffron/[0.08] text-saffron">
                        <InstrumentGlyph name={sound.name} />
                        <span className="absolute inset-x-3 bottom-2 h-px bg-saffron/36" aria-hidden={true} />
                    </span>
                    <div className="hidden min-w-[130px] sm:block">
                        <MiniWaveform bars={sound.waveform} />
                    </div>
                </div>

                <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron/72">
                        Today&apos;s Sound
                    </p>
                    <h2 id="todays-sound-title" className="mt-1 text-xl font-black text-white">
                        Today: the {sound.name}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-sand/58">
                        {sound.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => playSong(soundSong)}
                            aria-label={`${playing ? "Pause" : "Play"} ${sound.name} sample`}
                            aria-pressed={playing}
                            className="inline-flex h-9 items-center gap-2 rounded-full border border-saffron/24 bg-saffron/[0.08] px-3 text-xs font-black text-saffron transition hover:bg-saffron hover:text-[#171210] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                        >
                            {playing ? (
                                <Pause className="size-3.5 fill-current" aria-hidden={true} />
                            ) : (
                                <Play className="size-3.5 fill-current" aria-hidden={true} />
                            )}
                            15s sample
                        </button>
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-black text-sand/52">
                            {sound.detail}
                        </span>
                    </div>
                </div>

                <Link
                    href={sound.href}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-saffron px-4 text-sm font-black text-[#171210] transition hover:bg-[#f0a23b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                >
                    Create with {sound.name}
                    <ArrowRight className="size-4" aria-hidden={true} />
                </Link>
            </div>
        </section>
    )
}

function InstrumentGlyph({ name }: { name: string }) {
    if (name === "Duholl") {
        return <Drum className="size-7" aria-hidden={true} />
    }

    if (name === "Makkuran vocal") {
        return <Mic2 className="size-7" aria-hidden={true} />
    }

    return (
        <svg
            className="size-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
            aria-hidden={true}
        >
            <path d="M15.5 4.5 7.2 12.8" />
            <path d="M17.2 3.8 19.2 5.8" />
            <path d="M8 12.1c2.8 1.2 4.1 4.9 1.8 7.2-1.5 1.5-4.1 1.2-5.4-.1-1.4-1.4-1.6-3.9-.1-5.4 1-1 2.4-1.5 3.7-1.7Z" />
            <path d="M4.4 9.4 19.8 15" />
        </svg>
    )
}

function HeroAction({
    href,
    icon,
    label,
    primary = false,
    quiet = false,
}: {
    href: string
    icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
    label: string
    primary?: boolean
    quiet?: boolean
}) {
    const Icon = icon
    const className = primary
        ? "bg-saffron text-[#171210] shadow-[0_14px_34px_rgba(227,122,44,0.22)] hover:bg-[#f0a23b]"
        : quiet
            ? "border border-white/10 bg-white/[0.045] text-sand/82 hover:border-white/18 hover:bg-white/[0.07] hover:text-white"
            : "border border-saffron/22 bg-saffron/[0.08] text-white hover:border-saffron/38 hover:bg-saffron/[0.12]"

    return (
        <Link
            href={href}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${className}`}
        >
            <Icon className={`size-4 ${primary ? "" : "text-saffron"}`} aria-hidden={true} />
            {label}
        </Link>
    )
}

function QuickStartVisual({ kind, waveform }: { kind: StudioActionKind; waveform: number[] }) {
    if (kind === "lyrics") {
        return (
            <div className="absolute inset-x-4 bottom-4 space-y-1.5" aria-hidden={true}>
                {[72, 48, 86, 58].map((width, index) => (
                    <span key={index} className="block h-1 rounded-full bg-white/36" style={{ width: `${width}%` }} />
                ))}
            </div>
        )
    }

    if (kind === "radio") {
        return (
            <div className="absolute inset-x-4 bottom-4 rounded-full border border-saffron/20 bg-black/24 px-3 py-2 backdrop-blur-sm" aria-hidden={true}>
                <WaveformStrip bars={waveform} tone="warm" compact />
            </div>
        )
    }

    if (kind === "remix") {
        return (
            <div className="absolute inset-x-4 bottom-4 space-y-1.5" aria-hidden={true}>
                <LayeredWaveform bars={waveform} />
            </div>
        )
    }

    return (
        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-1.5" aria-hidden={true}>
            {waveform.slice(0, 10).map((height, index) => (
                <span key={index} className="flex-1 rounded-full bg-saffron/55" style={{ height: `${Math.max(12, height * 0.45)}px` }} />
            ))}
        </div>
    )
}

const RECENT_WORK_BADGE: Record<string, string> = {
    draft: "border-saffron/30 bg-saffron/10 text-saffron",
    song: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    capture: "border-sky-400/30 bg-sky-400/10 text-sky-300",
}

function RecentWorkTrack({
    item,
    onRename,
    onDelete,
    onNotify,
}: {
    item: RecentWorkItem
    onRename: (id: string, title: string) => void
    onDelete: (id: string) => void
    onNotify: (message: string) => void
}) {
    const router = useRouter()
    const { playSong, isCurrentSong, isPlaying } = usePlaySong()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
    const [titleDraft, setTitleDraft] = useState(item.title)
    const menuRef = useRef<HTMLDivElement>(null)
    const menuId = `recent-actions-${item.id}`

    const playable = item.duration !== "draft"
    const song = toPlayableSong({ id: item.id, title: item.title, duration: item.duration })
    const playing = playable && isCurrentSong(song) && isPlaying

    useEffect(() => {
        if (!isMenuOpen) return

        function handlePointerDown(event: PointerEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setIsMenuOpen(false)
        }

        document.addEventListener("pointerdown", handlePointerDown)
        document.addEventListener("keydown", handleEscape)
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [isMenuOpen])

    function handlePlay() {
        if (playable) playSong(song)
    }

    function submitRename(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const next = titleDraft.trim()
        if (!next) return
        onRename(item.id, next)
        setIsEditingTitle(false)
    }

    async function handleCopyLink() {
        setIsMenuOpen(false)
        try {
            const origin = typeof window !== "undefined" ? window.location.origin : ""
            await navigator.clipboard.writeText(`${origin}/song/${item.id}`)
            onNotify("Link copied to clipboard")
        } catch {
            onNotify("Couldn't copy the link")
        }
    }

    return (
        <div className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.028] p-2.5 transition hover:border-saffron/22 hover:bg-white/[0.045] sm:grid-cols-[auto_minmax(0,1fr)_150px_auto]">
            <div className="relative size-12 shrink-0">
                <CoverThumb image={item.image} label={item.title} />
                {playable ? (
                    <button
                        type="button"
                        onClick={handlePlay}
                        aria-label={`${playing ? "Pause" : "Play"} ${item.title}`}
                        aria-pressed={playing}
                        className={`absolute inset-0 flex items-center justify-center rounded-lg bg-black/35 text-white transition focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                            playing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                    >
                        {playing ? (
                            <Pause className="size-5 fill-current" aria-hidden={true} />
                        ) : (
                            <Play className="ml-0.5 size-5 fill-current" aria-hidden={true} />
                        )}
                    </button>
                ) : (
                    <Link
                        href={item.href}
                        aria-label={`Continue ${item.title}`}
                        className="absolute inset-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                    />
                )}
            </div>

            <div className="min-w-0">
                {isEditingTitle ? (
                    <form onSubmit={submitRename} className="flex items-center gap-2">
                        <input
                            autoFocus
                            value={titleDraft}
                            onChange={(event) => setTitleDraft(event.target.value)}
                            className="min-w-0 flex-1 rounded-md border border-saffron/30 bg-black/30 px-2 py-1 text-sm font-black text-white outline-none focus:border-saffron"
                        />
                        <button
                            type="submit"
                            className="shrink-0 rounded-md bg-saffron px-2.5 py-1 text-xs font-black text-[#171210] transition hover:bg-[#f0a23b]"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setTitleDraft(item.title)
                                setIsEditingTitle(false)
                            }}
                            className="shrink-0 rounded-md bg-white/[0.08] px-2.5 py-1 text-xs font-black text-sand/70 transition hover:text-sand"
                        >
                            Cancel
                        </button>
                    </form>
                ) : (
                    <>
                        <span className="flex items-center gap-2">
                            <Link
                                href={item.href}
                                className="truncate text-sm font-black text-white transition hover:text-saffron focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                            >
                                {item.title}
                            </Link>
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] ${RECENT_WORK_BADGE[item.type.toLowerCase()]}`}>
                                {item.type}
                            </span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-semibold text-sand/45">{item.metadata}</span>
                    </>
                )}
            </div>

            <span className="hidden min-w-0 items-center gap-2 sm:flex">
                <span className={`flex min-w-0 flex-1 ${playing ? "animate-pulse" : ""}`}>
                    <MiniWaveform bars={item.waveform} />
                </span>
                <span className="shrink-0 text-xs font-black tabular-nums text-sand/45">
                    {item.duration === "draft" ? "draft" : item.duration}
                </span>
                <span className="shrink-0 text-xs font-semibold text-sand/32" title={formatCreatedAtTitle(item.createdAt)}>
                    {formatRelativeDate(item.createdAt)}
                </span>
            </span>

            <div className="flex items-center gap-1.5">
                <span className="shrink-0 text-xs font-black tabular-nums text-sand/45 sm:hidden">
                    {item.duration === "draft" ? "draft" : item.duration}
                </span>
                {isConfirmingDelete ? (
                    <span className="inline-flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => {
                                setIsConfirmingDelete(false)
                                onDelete(item.id)
                                onNotify(`Deleted “${item.title}”`)
                            }}
                            className="rounded-md bg-red-500/85 px-2.5 py-1 text-xs font-black text-white transition hover:bg-red-500"
                        >
                            Delete
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsConfirmingDelete(false)}
                            className="rounded-md bg-white/[0.08] px-2.5 py-1 text-xs font-black text-sand/70 transition hover:text-sand"
                        >
                            Cancel
                        </button>
                    </span>
                ) : (
                    <div ref={menuRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen((open) => !open)}
                            aria-controls={menuId}
                            aria-expanded={isMenuOpen}
                            aria-haspopup="menu"
                            aria-label={`Open actions for ${item.title}`}
                            className="inline-flex size-9 items-center justify-center rounded-full text-sand/45 transition hover:bg-sand/8 hover:text-sand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                        >
                            <MoreHorizontal className="size-4" aria-hidden={true} />
                        </button>

                        {isMenuOpen && (
                            <div
                                id={menuId}
                                role="menu"
                                aria-label={`Actions for ${item.title}`}
                                className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-sand/12 bg-[#111113] p-1.5 text-left text-sm font-bold text-sand shadow-[0_18px_44px_rgba(0,0,0,0.45)]"
                            >
                                {playable && (
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                            setIsMenuOpen(false)
                                            handlePlay()
                                        }}
                                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sand/88 transition hover:bg-sand/10 hover:text-sand"
                                    >
                                        <Play className="size-4 text-sand/65" aria-hidden={true} />
                                        {playing ? "Pause" : "Play"}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setTitleDraft(item.title)
                                        setIsEditingTitle(true)
                                        setIsMenuOpen(false)
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sand/88 transition hover:bg-sand/10 hover:text-sand"
                                >
                                    <Pencil className="size-4 text-sand/65" aria-hidden={true} />
                                    Rename
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setIsMenuOpen(false)
                                        router.push(`/create?ref=${item.id}`)
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sand/88 transition hover:bg-sand/10 hover:text-sand"
                                >
                                    <Repeat2 className="size-4 text-sand/65" aria-hidden={true} />
                                    Remix
                                </button>
                                <div className="my-1 border-y border-sand/8 py-1">
                                    <p className="flex items-center gap-2.5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-sand/38">
                                        <Download className="size-3.5" aria-hidden={true} />
                                        Download
                                    </p>
                                    <div className="grid grid-cols-2 gap-1 px-1">
                                        {(["MP3", "WAV"] as const).map((format) => (
                                            <button
                                                key={format}
                                                type="button"
                                                role="menuitem"
                                                disabled
                                                className="cursor-not-allowed rounded-lg px-2.5 py-2 text-xs font-black text-sand/32"
                                            >
                                                {format}
                                                <span className="ml-1 text-[10px] uppercase tracking-[0.1em] text-sand/24">
                                                    soon
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={handleCopyLink}
                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sand/88 transition hover:bg-sand/10 hover:text-sand"
                                >
                                    <Copy className="size-4 text-sand/65" aria-hidden={true} />
                                    Copy link
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setIsMenuOpen(false)
                                        setIsConfirmingDelete(true)
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-red-300/90 transition hover:bg-red-500/10 hover:text-red-200"
                                >
                                    <Trash2 className="size-4" aria-hidden={true} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function MoodTile({ point }: { point: StartingPoint }) {
    const { playSong, isCurrentSong, isPlaying } = usePlaySong()
    const moodSong = toPlayableSong({
        id: `mood-${point.title.toLowerCase().replace(/\s+/g, "-")}`,
        title: `${point.title} preview`,
        duration: "0:15",
    })
    const playing = isCurrentSong(moodSong) && isPlaying

    return (
        <article
            className={`group relative min-h-[210px] w-[260px] shrink-0 snap-start overflow-hidden rounded-xl border border-white/[0.07] bg-gradient-to-br ${point.accent} p-3 transition hover:-translate-y-0.5 hover:border-saffron/22 sm:w-[290px]`}
        >
            <DemoVideoPoster
                src={point.image}
                className="absolute inset-y-0 right-0 w-[58%] object-cover opacity-[0.22] transition group-hover:opacity-[0.28]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/16 via-transparent to-black/34" aria-hidden={true} />
            <div className="relative z-10 flex min-h-[94px] flex-col justify-between">
                <span>
                    <span className="block text-sm font-black text-white">{point.title}</span>
                    <span className="mt-0.5 block text-xs font-semibold text-sand/54">{point.cue}</span>
                </span>
                <span className={playing ? "animate-pulse" : ""}>
                    <MiniWaveform bars={point.waveform} />
                </span>
            </div>
            <button
                type="button"
                onClick={() => playSong(moodSong)}
                aria-label={`${playing ? "Pause" : "Play"} ${point.title} mood preview`}
                aria-pressed={playing}
                className="absolute bottom-3 left-3 z-20 inline-flex size-10 items-center justify-center rounded-full bg-saffron text-[#171210] transition-transform hover:scale-105"
            >
                {playing ? (
                    <Pause className="fill-current" size={16} aria-hidden={true} />
                ) : (
                    <Play className="fill-current" size={16} aria-hidden={true} />
                )}
            </button>
            <Link
                href={point.href}
                className="absolute bottom-3 right-3 z-20 inline-flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-black/28 px-3 text-xs font-black text-sand/78 backdrop-blur-sm transition hover:border-saffron/24 hover:text-saffron focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
                Create with this mood
                <ArrowRight className="size-3.5" aria-hidden={true} />
            </Link>
        </article>
    )
}

function CoverThumb({ image, label }: { image: string; label: string }) {
    return (
        <span
            aria-label={label}
            role="img"
            className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.04] shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
        >
            <DemoVideoPoster
                src={image}
                className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/[0.04]" aria-hidden={true} />
        </span>
    )
}

function WaveformStrip({
    bars,
    compact = false,
    tone = "neutral",
}: {
    bars: number[]
    compact?: boolean
    tone?: "neutral" | "warm"
}) {
    const color = tone === "warm" ? "from-saffron/28 to-saffron/86" : "from-sand/20 to-sand/68"

    return (
        <div className={`flex items-center gap-1 ${compact ? "h-8" : "h-14"}`} aria-hidden={true}>
            {bars.map((height, index) => (
                <span
                    key={`${height}-${index}`}
                    className={`flex-1 rounded-full bg-gradient-to-t ${color}`}
                    style={{ height: `${Math.max(16, height)}%` }}
                />
            ))}
        </div>
    )
}

function MiniWaveform({ bars }: { bars: number[] }) {
    return (
        <span className="flex h-6 min-w-0 flex-1 items-center gap-0.5" aria-hidden={true}>
            {bars.map((height, index) => (
                <span
                    key={`${height}-${index}`}
                    className="w-1 flex-1 rounded-full bg-sand/28 transition group-hover:bg-saffron/48"
                    style={{ height: `${Math.max(18, height)}%` }}
                />
            ))}
        </span>
    )
}

function LayeredWaveform({ bars }: { bars: number[] }) {
    return (
        <div className="space-y-1.5">
            <div className="flex h-5 items-center gap-1">
                {bars.slice(0, 8).map((height, index) => (
                    <span key={`top-${index}`} className="flex-1 rounded-full bg-saffron/52" style={{ height: `${Math.max(18, height)}%` }} />
                ))}
            </div>
            <div className="ml-6 flex h-5 items-center gap-1">
                {bars.slice(4, 12).map((height, index) => (
                    <span key={`bottom-${index}`} className="flex-1 rounded-full bg-[#8ea0b5]/42" style={{ height: `${Math.max(18, 86 - height)}%` }} />
                ))}
            </div>
        </div>
    )
}

function quickStartChrome(kind: StudioActionKind): string {
    if (kind === "lyrics") return "hover:shadow-[0_18px_54px_rgba(128,74,46,0.16)]"
    if (kind === "instrument") return "hover:shadow-[0_18px_54px_rgba(227,122,44,0.14)]"
    if (kind === "radio") return "hover:shadow-[0_18px_54px_rgba(55,77,95,0.18)]"
    if (kind === "voice") return "hover:shadow-[0_18px_54px_rgba(46,143,154,0.16)]"
    return "hover:shadow-[0_18px_54px_rgba(88,72,108,0.16)]"
}

function DashboardToast({ message }: { message: string }) {
    if (!message) return null

    return (
        <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--app-bottom-safe-area)+5rem)] z-[120] flex justify-center px-4 lg:bottom-[calc(var(--app-bottom-player-height)+1.5rem)]"
        >
            <span className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-[#1a1a1c]/95 px-4 py-2.5 text-sm font-black text-sand shadow-[0_18px_44px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <Sparkles className="size-4 text-saffron" aria-hidden={true} />
                {message}
            </span>
        </div>
    )
}
