"use client"

import { useEffect, useMemo, useRef, useState, Suspense } from "react"
import type { ReactNode } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Dices,
  Filter,
  Folder,
  FolderSearch,
  Heart,
  Info,
  Maximize2,
  Loader2,
  MoreHorizontal,
  Mic2,
  Music2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Square,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react"

import { usePlaySong } from "@/hooks/use-play-song"
import {
  LanguageSwitcher,
  type Language,
} from "@/components/create/language-switcher"
import { durationOptionToSeconds, generateMusic, providerDurationToLabel } from "@/lib/music-client"
import { useLibraryStore } from "@/stores/library-store"
import type { GenrePreset, Instrument, Song } from "@/lib/types"

// MVP: only Makkuran dialect is supported in first release
const MVP_DIALECT = "Makkuran" as const
type Dialect = typeof MVP_DIALECT
type StudioStatus = "idle" | "queued" | "generating" | "mixing" | "done"
type LyricsMode = "write" | "prompt" | "instrumental"
type CreateMode = "Simple" | "Advanced"
type InputTab = "Audio" | "Voice" | "Inspo"
type VocalGender = "male" | "female"
type DurationOption = "30s" | "1min" | "2min" | "4min"
type VariationCount = 1 | 2 | 4
type TrackInputTab = "upload" | "workspace"
type VoiceInputTab = "upload" | "record" | "library"
type TrackDownloadFormat = "MP3" | "WAV"
type MusicKey =
  | "Auto"
  | "C major"
  | "G major"
  | "D major"
  | "A minor"
  | "E minor"
  | "D minor"
  | "F major"
  | "Bb major"

const SONG_DESCRIPTION_MAX_LENGTH = 200
const SONG_DESCRIPTION_WARNING_LENGTH = 180
const USER_CREDITS = 75
const LANGUAGE_OPTIONS = ["Balochi", "Urdu", "English", "Arabic", "Brahui"] as const
type SongLanguage = (typeof LANGUAGE_OPTIONS)[number]

const RTL_LYRICS_LANGUAGES = new Set<SongLanguage>(["Balochi", "Urdu", "Arabic"])
const LYRICS_STRUCTURE_TAGS = [
  "[Intro]",
  "[Verse]",
  "[Chorus]",
  "[Bridge]",
  "[Outro]",
  "[Instrumental]",
  "[Hook]",
] as const

const DURATION_OPTIONS: {
  value: DurationOption
  label: string
  credits: number
}[] = [
  { value: "30s", label: "30s", credits: 5 },
  { value: "1min", label: "1min", credits: 8 },
  { value: "2min", label: "2min", credits: 10 },
  { value: "4min", label: "4min", credits: 20 },
]

const DURATION_CREDIT_COST: Record<DurationOption, number> = {
  "30s": 5,
  "1min": 8,
  "2min": 10,
  "4min": 20,
}

const VARIATION_OPTIONS: VariationCount[] = [1, 2, 4]
const TRACK_INPUT_ACCEPT = ".mp3,.wav,.flac,.m4a"
const TRACK_INPUT_ALLOWED_EXTENSIONS = new Set(["mp3", "wav", "flac", "m4a"])
const TRACK_INPUT_MAX_SIZE_BYTES = 50 * 1024 * 1024
const TRACK_INPUT_MAX_SIZE_LABEL = "50MB"
const TRACK_INPUT_MAX_DURATION_LABEL = "8 minutes"
const TRACK_INPUT_PLACEHOLDER_DURATION = "~3:20"
const TRACK_ACTIONS_COMING_SOON = ["Extend", "Cover", "Stems", "Make Persona"] as const
const VOICE_INPUT_ACCEPT = ".mp3,.wav,.m4a,.ogg"
const VOICE_INPUT_ALLOWED_EXTENSIONS = new Set(["mp3", "wav", "m4a", "ogg"])
const VOICE_INPUT_MAX_SIZE_BYTES = 10 * 1024 * 1024
const VOICE_INPUT_MAX_SIZE_LABEL = "10MB"
const VOICE_INPUT_MAX_DURATION_LABEL = "60s"
const VOICE_INPUT_MIN_RECORD_SECONDS = 15
const VOICE_INPUT_MAX_RECORD_SECONDS = 60
// MOCK: stand-in for the AI lyrics endpoint (Task 6b) until the backend ships.
const MOCK_AI_LYRICS = [
  "[Verse]\nNight folds soft over the Makran shore\nA Damboora hums what the heart kept before\nThe tide remembers every name we gave\nEvery footprint the morning will save\n\n[Chorus]\nSing me home, O coastal wind\nCarry the song where the hills begin\nSing me home through the Suroz cry\nUnder a wide Balochi sky\n\n[Bridge]\nMiles of dust, a caravan light\nThe Duholl keeps the pulse of the night\n\n[Outro]\nSing me home, sing me home",
  "[Intro]\nQuiet strings, a single breath\n\n[Verse]\nFrom Turbat roads to Gwadar's bay\nThe old songs find a brand new day\nRabab and rain in the same refrain\nLove like the sea returns again\n\n[Chorus]\nHold the line, hold the flame\nWhisper soft my given name\nHold the line through dusk and dawn\nThe melody carries on",
] as const
const BPM_QUICK_PICKS = [
  { label: "Slow", value: 70 },
  { label: "Mid", value: 100 },
  { label: "Fast", value: 130 },
  { label: "Driving", value: 160 },
] as const
const KEY_OPTIONS: MusicKey[] = [
  "Auto",
  "C major",
  "G major",
  "D major",
  "A minor",
  "E minor",
  "D minor",
  "F major",
  "Bb major",
]

interface GeneratedSong {
  id: string
  title: string
  prompt: string
  lyrics: string
  genre: GenrePreset
  dialect: Dialect
  instruments: Instrument[]
  duration: string
  createdAt: string
  isPublic: boolean
  likes: number
  plays: number
  bpm: number
  musicKey: MusicKey
  creditsUsed: number
  variationIndex: number
  variationCount: VariationCount
  audioUrl: string
}

interface PendingGeneration {
  prompt: string
  lyrics: string
  title: string
  duration: DurationOption
  bpm: number
  musicKey: MusicKey
  creditsUsed: number
  variationCount: VariationCount
  modeLabel: string
}

const STATUS_LABELS: Record<StudioStatus, string> = {
  idle: "Ready",
  queued: "Queued",
  generating: "Generating melody",
  mixing: "Mixing instruments",
  done: "Track ready",
}

const GENERATION_STAGES: Exclude<StudioStatus, "idle" | "done">[] = [
  "queued",
  "generating",
  "mixing",
]

const MOCK_TITLES = [
  "Makran Evening",
  "Coastal Soroz",
  "Suroz at Dawn",
  "Damboora Night",
  "Memory of Gwadar",
  "Kech Valley Song",
] as const

const STYLE_SUGGESTIONS = [
  "sombrio",
  "sweet vocal",
  "trap/rap",
  "sound design",
  "atmospheric guitars",
  "Makkuran folk",
  "coastal groove",
] as const

type StyleChipIconKind = "suroz" | "benju" | "rabab" | "duholl" | "dambora" | "vocal" | "coastal"

const ADVANCED_STYLE_CHIPS: { label: string; icon: StyleChipIconKind }[] = [
  { label: "Suroz", icon: "suroz" },
  { label: "Benju", icon: "benju" },
  { label: "Rabab", icon: "rabab" },
  { label: "Duholl", icon: "duholl" },
  { label: "Dambora", icon: "dambora" },
  { label: "Makkuran vocal", icon: "vocal" },
  { label: "Coastal folk", icon: "coastal" },
]

const SURPRISE_PROMPTS = {
  default: [
    "A slow Balochi folk song about the sea at night",
    "Upbeat wedding celebration with Duholl drums",
    "Coastal Makkuran groove, Suroz leading, sunset energy",
    "Melancholy Dambora ballad about leaving home",
    "Modern Balochi pop with electronic textures",
    "Dawn prayer call reimagined as ambient music",
    "Festival drums building from silence to full energy",
    "Rabab melody over a lo-fi hip-hop beat",
    "Caravan road song, steady rhythm, open desert",
    "Rain on a tin roof in Gwadar, soft piano underneath",
  ],
  instrumental: [
    "Dambora and hand drum rhythm, desert caravan energy",
    "Suroz solo over a drone, coastal morning",
    "Cinematic strings building to a Duholl climax",
    "Lo-fi Rabab loops with rain ambience",
    "Benju-driven celebration rhythm, no vocals",
  ],
  inspo: [
    "Turn this into a lo-fi bedroom version",
    "Make it acoustic with just voice and guitar",
    "Speed it up and add electronic production",
    "Strip to vocals and rebuild as ambient",
    "Flip the genre to cinematic orchestral",
  ],
} as const

interface FormState {
  inputSource: InputTab
  instrumental: boolean
  lyrics: string
}

function getSuggestions(formState: FormState): string[] {
  if (formState.instrumental) {
    return [
      "percussive",
      "ambient",
      "driving rhythm",
      "atmospheric",
      "cinematic",
      "lo-fi",
      "Dambora groove",
      "Suroz melody",
    ]
  }

  if (formState.lyrics.length > 0) {
    return [
      "ballad",
      "anthem",
      "storytelling",
      "emotional",
      "love song",
      "protest",
      "lullaby",
      "spoken word",
    ]
  }

  if (formState.inputSource === "Inspo") {
    return [
      "acoustic version",
      "slowed + reverb",
      "genre flip",
      "strip to vocals",
      "add bass",
      "lo-fi remix",
      "orchestral",
    ]
  }

  if (formState.inputSource === "Voice") {
    return [
      "raspy",
      "smooth",
      "powerful",
      "whisper",
      "falsetto",
      "deep",
      "young",
      "weathered",
    ]
  }

  return [...STYLE_SUGGESTIONS]
}

function getRandomPrompt(
  formState: FormState,
  lastPrompt: string | null,
): string {
  const pool =
    formState.instrumental
      ? SURPRISE_PROMPTS.instrumental
      : formState.inputSource === "Inspo"
        ? SURPRISE_PROMPTS.inspo
        : SURPRISE_PROMPTS.default

  if (pool.length <= 1) {
    return pool[0]
  }

  let prompt: string
  do {
    prompt = pool[Math.floor(Math.random() * pool.length)]
  } while (prompt === lastPrompt)

  return prompt
}

const MOCK_REFERENCE_TRACKS: Record<
  string,
  { title: string; duration: string; createdAt: string }
> = {
  "song-long-road-demo": {
    title: "Long Road demo",
    duration: "3:42",
    createdAt: "2026-06-07T22:00:00.000Z",
  },
  "capture-desert-night": {
    title: "Desert Night Radio",
    duration: "0:30",
    createdAt: "2026-05-28T00:00:00.000Z",
  },
  "capture-desert-night-30s": {
    title: "Desert Night 30s",
    duration: "0:30",
    createdAt: "2026-05-28T00:00:00.000Z",
  },
}

// MOCK: Makkuran/Balochi-inspired lyric fragments for the Wand button
const MOCK_LYRIC_IDEAS = [
  "\n[Verse]\nThe Makran wind carries forgotten names\nDamboora strings echo across the dunes",
  "\n[Chorus]\nO Gwadar, your tides sing the old songs\nEvery wave a verse, every shore a home",
  "\n[Bridge]\nSuroz cries at dawn, the valley listens\nStones remember what the people forgot",
  "\n[Verse]\nFrom Turbat to the coast, the road hums\nA melody older than the hills themselves",
  "\n[Chorus]\nBalochi hearts beat in Makkuran time\nThe rhythm of the land, the pulse of the sea",
] as const

function getMockTitle(): string {
  return MOCK_TITLES[Math.floor(Math.random() * MOCK_TITLES.length)]
}

function getRandomLyricIdea(): string {
  return MOCK_LYRIC_IDEAS[Math.floor(Math.random() * MOCK_LYRIC_IDEAS.length)]
}

function formatElapsedTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function formatSongDate(createdAt: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(createdAt))
}

function formatFileSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024)
  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)}MB`
}

// Task 9b: deterministic gradient placeholder cover art derived from a seed
// (track id), so each generated track gets a stable, distinct thumbnail.
function coverGradient(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 360
  }
  const hue = hash
  const hue2 = (hash + 42) % 360
  return `linear-gradient(135deg, hsl(${hue} 64% 42%) 0%, hsl(${hue2} 58% 26%) 58%, #141312 100%)`
}

// Quick win: persist the in-progress composer to localStorage so a refresh or
// mode switch never loses typed input.
const CREATE_DRAFT_KEY = "zahirok:create-draft:v1"

interface CreateDraft {
  lyrics: string
  lyricsPrompt: string
  stylePrompt: string
  songTitle: string
  songDescription: string
  selectedLanguage: SongLanguage
  selectedDuration: DurationOption
  variationCount: VariationCount
  bpm: number
  musicKey: MusicKey
  vocalGender: VocalGender
  weirdness: number
  styleInfluence: number
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function readCreateDraft(): Partial<CreateDraft> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(CREATE_DRAFT_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const draft: Partial<CreateDraft> = {}

    if (typeof parsed.lyrics === "string") draft.lyrics = parsed.lyrics
    if (typeof parsed.lyricsPrompt === "string") draft.lyricsPrompt = parsed.lyricsPrompt
    if (typeof parsed.stylePrompt === "string") draft.stylePrompt = parsed.stylePrompt
    if (typeof parsed.songTitle === "string") draft.songTitle = parsed.songTitle
    if (typeof parsed.songDescription === "string") {
      draft.songDescription = parsed.songDescription.slice(0, SONG_DESCRIPTION_MAX_LENGTH)
    }
    if (LANGUAGE_OPTIONS.includes(parsed.selectedLanguage as SongLanguage)) {
      draft.selectedLanguage = parsed.selectedLanguage as SongLanguage
    }
    if (DURATION_OPTIONS.some((option) => option.value === parsed.selectedDuration)) {
      draft.selectedDuration = parsed.selectedDuration as DurationOption
    }
    if (VARIATION_OPTIONS.includes(parsed.variationCount as VariationCount)) {
      draft.variationCount = parsed.variationCount as VariationCount
    }
    if (typeof parsed.bpm === "number" && Number.isFinite(parsed.bpm)) {
      draft.bpm = Math.min(200, Math.max(60, Math.round(parsed.bpm)))
    }
    if (KEY_OPTIONS.includes(parsed.musicKey as MusicKey)) {
      draft.musicKey = parsed.musicKey as MusicKey
    }
    if (parsed.vocalGender === "male" || parsed.vocalGender === "female") {
      draft.vocalGender = parsed.vocalGender
    }
    if (typeof parsed.weirdness === "number") draft.weirdness = clampPercent(parsed.weirdness)
    if (typeof parsed.styleInfluence === "number") {
      draft.styleInfluence = clampPercent(parsed.styleInfluence)
    }

    return draft
  } catch {
    return {}
  }
}

// Quick win: map a detected track length (seconds) to the nearest duration
// preset so Remix can auto-fill the duration selector from the reference track.
function durationOptionFromSeconds(seconds: number): DurationOption {
  const targets: { value: DurationOption; seconds: number }[] = [
    { value: "30s", seconds: 30 },
    { value: "1min", seconds: 60 },
    { value: "2min", seconds: 120 },
    { value: "4min", seconds: 240 },
  ]
  return targets.reduce((closest, option) =>
    Math.abs(option.seconds - seconds) < Math.abs(closest.seconds - seconds)
      ? option
      : closest,
  ).value
}

function parseClockToSeconds(value: string): number | null {
  const match = /^(\d+):([0-5]?\d)$/.exec(value.trim())
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

function makeGeneratedSong({
  id,
  audioUrl,
  bpm,
  creditsUsed,
  duration,
  musicKey,
  prompt,
  lyrics,
  title,
  variationCount,
  variationIndex,
}: {
  id?: string
  audioUrl: string
  bpm: number
  creditsUsed: number
  duration: DurationOption | string
  musicKey: MusicKey
  prompt: string
  lyrics: string
  title?: string
  variationCount: VariationCount
  variationIndex: number
}): GeneratedSong {
  const baseTitle = title || getMockTitle()
  return {
    id: id ?? `generated-${Date.now()}-${variationIndex}-${Math.random().toString(36).slice(2, 8)}`,
    title:
      variationCount > 1
        ? `${baseTitle} V${variationIndex}`
        : baseTitle,
    prompt,
    lyrics,
    genre: "Soroz",
    dialect: MVP_DIALECT,
    instruments: ["Damboora", "Suroz"],
    duration,
    createdAt: new Date().toISOString(),
    isPublic: false,
    likes: 0,
    plays: 0,
    bpm,
    musicKey,
    creditsUsed,
    variationIndex,
    variationCount,
    audioUrl,
  }
}

function toPlayerSong(song: GeneratedSong): Song {
  return {
    id: song.id,
    title: song.title,
    prompt: song.prompt,
    genrePreset: song.genre,
    instruments: song.instruments,
    lyrics: song.lyrics,
    status: "completed",
    audioUrl: song.audioUrl,
    mp3Url: song.audioUrl,
    wavUrl: song.audioUrl,
    isPublic: song.isPublic,
    createdAt: song.createdAt,
    duration: song.duration,
    plays: song.plays,
    likes: song.likes,
    remixes: 0,
  }
}

// Wrap in Suspense because useSearchParams requires it in Next.js 16
export default function CreatePage() {
  return (
    <Suspense fallback={null}>
      <CreatePageInner />
    </Suspense>
  )
}

function CreatePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPrompt = searchParams.get("prompt")?.slice(0, SONG_DESCRIPTION_MAX_LENGTH) ?? ""
  // Lazily read any persisted draft once, then seed the composer fields from it.
  const [draft] = useState<Partial<CreateDraft>>(readCreateDraft)
  const [createMode, setCreateMode] = useState<CreateMode>("Simple")
  const [inputTab, setInputTab] = useState<InputTab>("Audio")
  const [lyricsMode, setLyricsMode] = useState<LyricsMode>("write")
  const [lyrics, setLyrics] = useState(() => draft.lyrics ?? "")
  const [lyricsPrompt, setLyricsPrompt] = useState(() => draft.lyricsPrompt ?? "")
  const [songDescription, setSongDescription] = useState(
    () => initialPrompt || (draft.songDescription ?? ""),
  )
  const [stylePrompt, setStylePrompt] = useState(() => draft.stylePrompt ?? "")
  const [songTitle, setSongTitle] = useState(() => draft.songTitle ?? "")
  const [language, setLanguage] = useState<Language>(() => {
    const saved = draft.selectedLanguage
    return saved === "Balochi" ? "balochi" : "english"
  })
  const selectedLanguage: SongLanguage =
    language === "balochi" ? "Balochi" : "English"
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(
    () => draft.selectedDuration ?? "2min",
  )
  const [variationCount, setVariationCount] = useState<VariationCount>(
    () => draft.variationCount ?? 2,
  )
  const [bpm, setBpm] = useState(() => draft.bpm ?? 100)
  const [musicKey, setMusicKey] = useState<MusicKey>(() => draft.musicKey ?? "Auto")
  const [vocalGender, setVocalGender] = useState<VocalGender>(
    () => draft.vocalGender ?? "male",
  )
  const [weirdness, setWeirdness] = useState(() => draft.weirdness ?? 50)
  const [styleInfluence, setStyleInfluence] = useState(() => draft.styleInfluence ?? 50)
  const [status, setStatus] = useState<StudioStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [generatedSongs, setGeneratedSongs] = useState<GeneratedSong[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [importedPrompt, setImportedPrompt] = useState(Boolean(initialPrompt))
  const [panelNote, setPanelNote] = useState("")
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false)
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null)
  const [composerNotice, setComposerNotice] = useState("")
  const [isLyricsOpen, setIsLyricsOpen] = useState(false)
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false)
  const [isWritingLyrics, setIsWritingLyrics] = useState(false)
  const [isStylesOpen, setIsStylesOpen] = useState(false)
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false)
  const [referenceUsagePrompt, setReferenceUsagePrompt] = useState("")
  const [initialReferenceTrackId, setInitialReferenceTrackId] = useState<string | null>(null)
  const [sortLabel, setSortLabel] = useState<"Newest" | "Oldest">("Newest")
  const [toolbarNote, setToolbarNote] = useState("")
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null)
  const [generationElapsedSeconds, setGenerationElapsedSeconds] = useState(0)
  const [activeGeneration, setActiveGeneration] = useState<PendingGeneration | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const generationAbortRef = useRef<AbortController | null>(null)
  const generationInFlightRef = useRef(false)
  const pendingGenerationRef = useRef<PendingGeneration>({
    prompt: "",
    lyrics: "",
    title: "",
    duration: "2min",
    bpm: 100,
    musicKey: "Auto",
    creditsUsed: 10,
    variationCount: 2,
    modeLabel: "Create Song",
  })
  // Token guarding the one-time completion of a generation. React StrictMode
  // double-invokes the progress updater, so without this the tracks would be
  // created (and persisted) twice.
  const completedGenerationRef = useRef<PendingGeneration | null>(null)
  const audioMenuRef = useRef<HTMLDivElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const lyricsTextareaRef = useRef<HTMLTextAreaElement>(null)
  const autoWriteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleCreateRef = useRef<() => void>(() => {})
  const { playSong, isCurrentSong, isPlaying } = usePlaySong()
  const prefilled = useRef(Boolean(initialPrompt))
  const lastSurprisePromptRef = useRef<string | null>(null)
  const refTrackId = searchParams.get("ref")
  const captureId = searchParams.get("capture")
  const startParam = searchParams.get("start")
  const textDir = RTL_LYRICS_LANGUAGES.has(selectedLanguage) ? "rtl" : "ltr"
  const lyricsDir = textDir
  const lyricsCharCount = lyrics.length
  const lyricsWordCount = lyrics.trim() ? lyrics.trim().split(/\s+/).length : 0
  const isSongDescriptionWarning =
    songDescription.length >= SONG_DESCRIPTION_WARNING_LENGTH
  const durationCreditCost = DURATION_CREDIT_COST[selectedDuration]
  const totalCreditCost = durationCreditCost * variationCount
  const formState = useMemo<FormState>(
    () => ({
      inputSource: inputTab,
      instrumental: lyricsMode === "instrumental",
      lyrics,
    }),
    [inputTab, lyrics, lyricsMode],
  )
  const suggestionTags = useMemo(() => getSuggestions(formState), [formState])

  // Prefill song description from dashboard ?prompt= query param (once only)
  useEffect(() => {
    if (prefilled.current) return

    const incoming = searchParams.get("prompt")
    if (!incoming) return

    const timeoutId = window.setTimeout(() => {
      prefilled.current = true
      setSongDescription(incoming.slice(0, SONG_DESCRIPTION_MAX_LENGTH))
      setImportedPrompt(true)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [searchParams])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (refTrackId || captureId) {
        setCreateMode("Advanced")
        setInputTab("Inspo")
        setInitialReferenceTrackId(refTrackId ?? captureId)
        const reference = MOCK_REFERENCE_TRACKS[refTrackId ?? captureId ?? ""]
        if (reference) {
          setToolbarNote(`${reference.title} loaded as reference.`)
        }
      }

      if (startParam) {
        setCreateMode("Advanced")

        switch (startParam) {
          case "lyrics":
            setIsLyricsOpen(true)
            break
          case "instrument":
            setIsStylesOpen(true)
            setLyricsMode("instrumental")
            break
          case "inspo":
            setInputTab("Inspo")
            break
          case "voice":
            setInputTab("Voice")
            break
          default:
            break
        }
      }
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [captureId, refTrackId, startParam])

  useEffect(
    () => () => {
      if (autoWriteTimeoutRef.current) {
        clearTimeout(autoWriteTimeoutRef.current)
      }
    },
    [],
  )

  // Quick win: persist the composer draft to localStorage whenever it changes.
  useEffect(() => {
    const payload: CreateDraft = {
      lyrics,
      lyricsPrompt,
      stylePrompt,
      songTitle,
      songDescription,
      selectedLanguage,
      selectedDuration,
      variationCount,
      bpm,
      musicKey,
      vocalGender,
      weirdness,
      styleInfluence,
    }
    try {
      window.localStorage.setItem(CREATE_DRAFT_KEY, JSON.stringify(payload))
    } catch {
      // Ignore storage failures (private mode, quota, disabled storage).
    }
  }, [
    lyrics,
    lyricsPrompt,
    stylePrompt,
    songTitle,
    songDescription,
    selectedLanguage,
    selectedDuration,
    variationCount,
    bpm,
    musicKey,
    vocalGender,
    weirdness,
    styleInfluence,
  ])

  // Keep the keyboard shortcut pointed at the latest generate handler.
  useEffect(() => {
    handleCreateRef.current = handleCreate
  })

  // Quick win: ⌘/Ctrl + Enter triggers Generate from anywhere on the page.
  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault()
        handleCreateRef.current()
      }
    }
    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [])

  useEffect(() => {
    if (!isAudioMenuOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (
        audioMenuRef.current &&
        !audioMenuRef.current.contains(event.target as Node)
      ) {
        setIsAudioMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAudioMenuOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isAudioMenuOpen])

  const hasCreationInput =
    lyricsMode === "instrumental" ||
    lyrics.trim().length > 0 ||
    lyricsPrompt.trim().length > 0 ||
    songDescription.trim().length > 0 ||
    stylePrompt.trim().length > 0
  const isGenerating = status === "queued" || status === "generating" || status === "mixing"
  const canCreate = hasCreationInput && !isGenerating
  const stageIndex = GENERATION_STAGES.indexOf(
    status as Exclude<StudioStatus, "idle" | "done">,
  )
  const queue = useMemo(() => generatedSongs.map(toPlayerSong), [generatedSongs])
  // Active style chips are derived from the comma-separated style prompt, so the
  // icon buttons reflect (and toggle) the same value the textarea already holds.
  const activeStyleTokens = useMemo(
    () =>
      new Set(
        stylePrompt
          .split(",")
          .map((token) => token.trim().toLowerCase())
          .filter(Boolean),
      ),
    [stylePrompt],
  )

  useEffect(() => {
    if (!isGenerating || generationStartedAt == null) return

    const elapsedTimer = window.setInterval(() => {
      setGenerationElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - generationStartedAt) / 1000)),
      )
    }, 1000)

    return () => window.clearInterval(elapsedTimer)
  }, [generationStartedAt, isGenerating])

  useEffect(() => {
    return () => {
      generationAbortRef.current?.abort()
    }
  }, [])

  function clearProgressTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function startProgressTimer(targetProgress = 90) {
    clearProgressTimer()
    intervalRef.current = setInterval(() => {
      setProgress((prev) => (prev >= targetProgress ? prev : prev + 2))
    }, 450)
  }

  async function handleCreate() {
    if (!canCreate || generationInFlightRef.current) return

    const promptParts = [
      songDescription.trim(),
      stylePrompt.trim() ? `Styles: ${stylePrompt.trim()}` : "",
      lyricsMode !== "instrumental" && lyrics.trim()
        ? `Lyrics: ${lyrics.trim()}`
        : "",
      lyricsMode !== "instrumental" && !lyrics.trim() && lyricsPrompt.trim()
        ? `Lyrics direction: ${lyricsPrompt.trim()}`
        : "",
      lyricsMode === "instrumental" ? "Instrumental only" : "",
      `Duration: ${selectedDuration}`,
      `BPM: ${bpm}`,
      `Key: ${musicKey}`,
    ].filter(Boolean)

    const pendingGeneration: PendingGeneration = {
      prompt: promptParts.join("\n") || "Soroz folk with Damboora and Suroz",
      lyrics: lyricsMode === "instrumental" ? "" : lyrics.trim() || lyricsPrompt.trim(),
      title: songTitle.trim(),
      duration: selectedDuration,
      bpm,
      musicKey,
      creditsUsed: totalCreditCost,
      variationCount,
      modeLabel: createMode === "Simple" ? "Create Song" : "Advanced",
    }
    pendingGenerationRef.current = pendingGeneration
    completedGenerationRef.current = null

    const abortController = new AbortController()
    generationAbortRef.current = abortController
    generationInFlightRef.current = true

    setComposerNotice("")
    setProgress(3)
    setActiveGeneration(pendingGeneration)
    setGenerationElapsedSeconds(0)
    setGenerationStartedAt(Date.now())
    setStatus("queued")

    window.setTimeout(() => {
      setStatus("generating")
      setProgress(12)
      startProgressTimer(88)
    }, 350)

    try {
      const useCustomLyrics =
        lyricsMode === "write" && pendingGeneration.lyrics.trim().length > 0

      const result = await generateMusic({
        prompt: pendingGeneration.prompt,
        duration: durationOptionToSeconds(pendingGeneration.duration),
        lyrics: useCustomLyrics ? pendingGeneration.lyrics : undefined,
        title: pendingGeneration.title || undefined,
        tags: stylePrompt.trim() || undefined,
        instrumental: lyricsMode === "instrumental",
        useCustomLyrics,
        description: songDescription.trim() || undefined,
        bpm: pendingGeneration.bpm,
        musicKey: pendingGeneration.musicKey,
        language: selectedLanguage,
        creditsCharged: pendingGeneration.creditsUsed,
        signal: abortController.signal,
      })

      clearProgressTimer()

      if (!result.success) {
        setComposerNotice(result.error)
        setStatus("idle")
        setProgress(0)
        setGenerationStartedAt(null)
        setActiveGeneration(null)
        return
      }

      setStatus("mixing")
      setProgress(92)

      const nextSong = makeGeneratedSong({
        id: result.songId,
        audioUrl: result.audioUrl,
        bpm: pendingGeneration.bpm,
        creditsUsed: pendingGeneration.creditsUsed,
        duration: providerDurationToLabel(result.duration),
        musicKey: pendingGeneration.musicKey,
        prompt: pendingGeneration.prompt,
        lyrics: pendingGeneration.lyrics,
        title: result.title || pendingGeneration.title,
        variationCount: 1,
        variationIndex: 1,
      })

      completedGenerationRef.current = pendingGeneration
      setGeneratedSongs((songs) => [nextSong, ...songs])
      useLibraryStore.getState().addSongs([toPlayerSong(nextSong)])

      if (pendingGeneration.variationCount > 1) {
        setComposerNotice(
          "Generated 1 track for this test build. Multi-variation generation will arrive in a later release.",
        )
      }

      setStatus("done")
      setProgress(100)
      setGenerationStartedAt(null)
      setActiveGeneration(null)
    } catch (error) {
      clearProgressTimer()

      if (error instanceof DOMException && error.name === "AbortError") {
        setComposerNotice("Generation cancelled.")
      } else {
        setComposerNotice("Music generation failed. Please try again.")
      }

      setStatus("idle")
      setProgress(0)
      setGenerationStartedAt(null)
      setActiveGeneration(null)
    } finally {
      generationInFlightRef.current = false
      generationAbortRef.current = null
    }
  }

  function handleCancelGeneration() {
    generationAbortRef.current?.abort()
    clearProgressTimer()
    generationInFlightRef.current = false
    setStatus("idle")
    setProgress(0)
    setGenerationStartedAt(null)
    setGenerationElapsedSeconds(0)
    setActiveGeneration(null)
  }

  function handlePlay(song: GeneratedSong) {
    playSong(toPlayerSong(song), queue)
  }

  function handleRenameTrack(songId: string, title: string) {
    const nextTitle = title.trim()
    if (!nextTitle) return

    setGeneratedSongs((songs) =>
      songs.map((song) =>
        song.id === songId ? { ...song, title: nextTitle } : song,
      ),
    )
    setToolbarNote("Track title updated.")
  }

  function handleDeleteTrack(songId: string) {
    const track = generatedSongs.find((song) => song.id === songId)

    setGeneratedSongs((songs) => songs.filter((song) => song.id !== songId))
    setLikedIds((current) => {
      const next = new Set(current)
      next.delete(songId)
      return next
    })
    setToolbarNote(track ? `${track.title} deleted.` : "Track deleted.")
  }

  function handleRemixTrack(song: GeneratedSong) {
    const seconds = parseClockToSeconds(song.duration)
    if (seconds != null) {
      setSelectedDuration(durationOptionFromSeconds(seconds))
    }
    setToolbarNote(`${song.title} loaded as a remix reference.`)
    router.push(`/create?ref=${song.id}`)
  }

  function handleTrackDownload(format: TrackDownloadFormat) {
    setToolbarNote(
      `Download will be available after generation is connected. ${format} export is not ready yet.`,
    )
  }

  async function handleCopyTrackLink(song: GeneratedSong) {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/song/${song.id}`
        : `/song/${song.id}`

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable")
      }

      await navigator.clipboard.writeText(shareUrl)
      setToolbarNote("Mock share link copied.")
    } catch {
      setToolbarNote("Could not copy link. Clipboard is unavailable.")
    }
  }

  // Bring the composer into view and focus it (composer lives in the left panel,
  // which is stacked above the workspace on mobile).
  function handleStartCreating() {
    setCreateMode("Simple")
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      window.requestAnimationFrame(() => {
        document.getElementById("song-description")?.focus()
      })
    }
  }

  function handleWand() {
    if (lyricsMode === "instrumental") {
      setPanelNote("Switch out of Instrumental to generate lyrics.")
      return
    }
    setPanelNote("")
    setLyrics((prev) => prev + getRandomLyricIdea())
  }

  // Task 6b: AI lyrics generation. MOCK — simulates an async write then inserts
  // generated lyrics into the editor. Wire to a real endpoint when available.
  function handleAutoWriteLyrics() {
    if (isGenerating || isWritingLyrics) return

    if (lyricsMode === "instrumental") {
      setPanelNote("Switch out of Instrumental to generate lyrics.")
      return
    }

    setLyricsMode("write")
    setPanelNote("")
    setIsWritingLyrics(true)

    if (autoWriteTimeoutRef.current) {
      clearTimeout(autoWriteTimeoutRef.current)
    }

    autoWriteTimeoutRef.current = setTimeout(() => {
      const draft = MOCK_AI_LYRICS[Math.floor(Math.random() * MOCK_AI_LYRICS.length)]
      setLyrics((prev) => (prev.trim() ? `${prev.trimEnd()}\n\n${draft}` : draft))
      setIsWritingLyrics(false)
      setPanelNote("Lyrics generation is a preview — connect the backend to go live.")
      autoWriteTimeoutRef.current = null
    }, 1300)
  }

  function handleSurpriseMe() {
    const idea = getRandomPrompt(formState, lastSurprisePromptRef.current)
    lastSurprisePromptRef.current = idea
    setSongDescription(idea.slice(0, SONG_DESCRIPTION_MAX_LENGTH))
    setImportedPrompt(false)
  }

  function handleSongDescriptionChange(value: string) {
    setSongDescription(value.slice(0, SONG_DESCRIPTION_MAX_LENGTH))
    setImportedPrompt(false)
  }

  function appendSuggestionTag(suggestion: string) {
    setSongDescription((value) => {
      const next = value ? `${value}, ${suggestion}` : suggestion
      return next.slice(0, SONG_DESCRIPTION_MAX_LENGTH)
    })
    setImportedPrompt(false)
  }

  function handleVoiceSampleAccepted() {
    setComposerNotice("Voice will influence generation when this feature launches.")
  }

  function handleReferenceAccepted() {
    setComposerNotice("Reference track saved — it will guide generation when this feature launches.")
  }

  function insertLyricsStructureTag(tag: (typeof LYRICS_STRUCTURE_TAGS)[number]) {
    if (isGenerating) return

    setLyricsMode("write")
    setPanelNote("")

    const textarea = lyricsTextareaRef.current
    let nextCursorPosition = 0

    setLyrics((value) => {
      const start = textarea?.selectionStart ?? value.length
      const end = textarea?.selectionEnd ?? value.length
      const before = value.slice(0, start)
      const after = value.slice(end)
      const prefix = before && !before.endsWith("\n") ? "\n" : ""
      const insertion = `${tag}\n`
      const suffix = after && !after.startsWith("\n") ? "\n" : ""

      nextCursorPosition = before.length + prefix.length + insertion.length
      return `${before}${prefix}${insertion}${suffix}${after}`
    })

    window.requestAnimationFrame(() => {
      lyricsTextareaRef.current?.focus()
      lyricsTextareaRef.current?.setSelectionRange(
        nextCursorPosition,
        nextCursorPosition,
      )
    })
  }

  // Toggle a style label in/out of the comma-separated style prompt.
  function toggleStyleChip(label: string) {
    setStylePrompt((value) => {
      const tokens = value
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean)
      const exists = tokens.some((token) => token.toLowerCase() === label.toLowerCase())
      const next = exists
        ? tokens.filter((token) => token.toLowerCase() !== label.toLowerCase())
        : [...tokens, label]
      return next.join(", ")
    })
    setImportedPrompt(false)
  }

  function handleTopTabClick(tab: InputTab) {
    setInputTab(tab)
    setIsAudioMenuOpen(false)
    setComposerNotice("")
  }

  function handleBrowseAudio() {
    setInputTab("Audio")
    setIsAudioMenuOpen(false)
    setSelectedAudioFile(null)
    setComposerNotice("")
  }

  function handleUploadAudioClick() {
    setInputTab("Audio")
    setIsAudioMenuOpen(false)
    setComposerNotice("")
    audioInputRef.current?.click()
  }

  function handleRecordAudio() {
    setInputTab("Audio")
    setIsAudioMenuOpen(false)
    setSelectedAudioFile(null)
    setComposerNotice("")
  }

  function handleAudioFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file) {
      setInputTab("Audio")
      setSelectedAudioFile(file)
      setComposerNotice("")
    }
  }

  function handleRemoveAudioFile() {
    setSelectedAudioFile(null)
    setComposerNotice("")

    if (audioInputRef.current) {
      audioInputRef.current.value = ""
    }
  }

  function toggleLiked(songId: string) {
    setLikedIds((cur) => {
      const next = new Set(cur)
      if (next.has(songId)) next.delete(songId)
      else next.add(songId)
      return next
    })
  }

  return (
    <div className="relative overflow-x-hidden bg-[#111111] text-sand lg:h-full lg:min-h-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_6%,rgba(227,122,44,0.14),transparent_24%),radial-gradient(circle_at_82%_10%,rgba(26,58,92,0.48),transparent_28%),linear-gradient(135deg,#141414_0%,#191716_48%,#101010_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(90deg,rgba(237,227,211,0.35)_1px,transparent_1px),linear-gradient(rgba(237,227,211,0.25)_1px,transparent_1px)] [background-size:36px_36px]" />

      <main className="relative z-10 grid grid-cols-1 gap-3 px-3 py-3 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(420px,480px)_minmax(0,1fr)] lg:gap-0 lg:overflow-hidden lg:px-0 lg:py-0">
        {/* ── LEFT PANEL ── */}
        <section className="rounded-2xl border border-sand/10 bg-[#181818]/95 shadow-[0_20px_60px_rgba(0,0,0,0.34)] lg:h-full lg:min-h-0 lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r lg:bg-[#171717]/92">
          <div className="flex h-full min-h-0 flex-col overflow-x-visible p-3 pb-4 sm:p-4 lg:overflow-y-auto lg:p-5 lg:pb-6 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
            {/* Top controls */}
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex h-10 rounded-full border border-sand/10 bg-black/20 p-1">
                {(["Simple", "Advanced"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setCreateMode(mode)}
                    aria-pressed={createMode === mode}
                    className={`rounded-full px-3.5 text-sm font-black transition ${
                      createMode === mode
                        ? "bg-sand/12 text-sand"
                        : "text-sand/50 hover:text-sand/75"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <LanguageSwitcher value={language} onChange={setLanguage} />
            </div>

            {/* Input tabs — Advanced only */}
            {createMode === "Advanced" && (
            <div className="relative z-30 mt-4 grid grid-cols-3 overflow-visible rounded-[1.25rem] border border-sand/8 bg-black/18 sm:mt-5 sm:rounded-[1.45rem]">
              {(["Audio", "Voice", "Inspo"] as const).map((tab) => {
                const isActive = inputTab === tab

                if (tab === "Audio") {
                  const isAudioActive = isActive || isAudioMenuOpen

                  return (
                    <div key={tab} ref={audioMenuRef} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setInputTab("Audio")
                          setComposerNotice("")
                          setIsAudioMenuOpen((open) => !open)
                        }}
                        aria-label="Add audio options"
                        aria-expanded={isAudioMenuOpen}
                        aria-controls="create-audio-options-menu"
                        aria-pressed={isAudioActive}
                        className={`relative flex h-12 w-full items-center justify-center gap-1.5 border-r border-sand/8 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-saffron sm:h-14 sm:gap-2 ${
                          isAudioActive
                            ? "bg-sand/[0.08] text-sand"
                            : "text-sand/50 hover:bg-sand/[0.04] hover:text-sand/75"
                        }`}
                      >
                        <Plus className={`size-4 ${isAudioActive ? "text-saffron" : "text-saffron/70"}`} aria-hidden="true" />
                        <span>{tab}</span>
                        <span
                          className={`absolute bottom-0 left-4 right-4 h-1 rounded-full bg-saffron transition-opacity ${
                            isAudioActive ? "opacity-100" : "opacity-0"
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      {isAudioMenuOpen && (
                        <CreateAudioOptionsMenu
                          onBrowse={handleBrowseAudio}
                          onUpload={handleUploadAudioClick}
                          onRecord={handleRecordAudio}
                        />
                      )}
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={handleAudioFileChange}
                      />
                    </div>
                  )
                }

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleTopTabClick(tab)}
                    aria-pressed={isActive}
                    className={`relative flex h-12 items-center justify-center gap-1.5 border-r border-sand/8 text-sm font-black last:border-r-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-saffron sm:h-14 sm:gap-2 ${
                      isActive
                        ? "bg-sand/[0.08] text-sand"
                        : "text-sand/50 hover:bg-sand/[0.04] hover:text-sand/75"
                    }`}
                  >
                    <Plus className={`size-4 ${isActive ? "text-saffron" : "text-saffron/70"}`} aria-hidden="true" />
                    <span>{tab}</span>
                    {tab === "Voice" && (
                      <span className="rounded-full bg-[#e37a2c] px-1.5 py-0.5 text-[var(--text-micro)] font-black leading-none text-[#171717]">
                        New
                      </span>
                    )}
                    <span
                      className={`absolute bottom-0 left-4 right-4 h-1 rounded-full bg-saffron transition-opacity ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                )
              })}
            </div>
            )}

            {createMode === "Advanced" && inputTab === "Voice" && (
              <VoiceInput
                isGenerating={isGenerating}
                vocalGender={vocalGender}
                onSampleAccepted={handleVoiceSampleAccepted}
                onVocalGenderChange={setVocalGender}
              />
            )}

            {createMode === "Advanced" && inputTab === "Inspo" && (
              <>
                <TrackInput
                  generatedTracks={generatedSongs}
                  initialSelectedTrackId={initialReferenceTrackId}
                  isGenerating={isGenerating}
                  onDurationDetected={setSelectedDuration}
                  onReferenceAccepted={handleReferenceAccepted}
                />
                <div className="mt-3 rounded-[1.25rem] border border-sand/8 bg-sand/[0.045] p-3 sm:rounded-[1.35rem] sm:p-4">
                  <label htmlFor="reference-usage-prompt" className="text-sm font-black text-sand/82">
                    How should the AI use this reference?
                  </label>
                  <textarea
                    id="reference-usage-prompt"
                    value={referenceUsagePrompt}
                    onChange={(event) => setReferenceUsagePrompt(event.target.value)}
                    disabled={isGenerating}
                    rows={2}
                    placeholder="Use the mood and rhythm, but change the genre to..."
                    className="mt-3 min-h-16 w-full resize-none bg-transparent text-sm font-semibold leading-6 text-sand outline-none placeholder:text-sand/40 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </>
            )}

            {(selectedAudioFile || composerNotice) && createMode === "Advanced" && inputTab === "Audio" && (
              <div className="mt-3">
                {selectedAudioFile ? (
                  <div
                    role="status"
                    className="inline-flex max-w-full items-center gap-2 rounded-full border border-saffron/25 bg-saffron/10 px-3 py-1.5 text-xs font-bold text-sand shadow-[0_10px_28px_rgba(0,0,0,0.18)]"
                  >
                    <Music2 className="size-3.5 shrink-0 text-saffron" aria-hidden="true" />
                    <span className="min-w-0 truncate">{selectedAudioFile.name}</span>
                    <span className="shrink-0 text-saffron">Mock upload</span>
                    <button
                      type="button"
                      aria-label={`Remove ${selectedAudioFile.name}`}
                      onClick={handleRemoveAudioFile}
                      className="-mr-1 flex size-5 shrink-0 items-center justify-center rounded-full text-sand/55 transition hover:bg-sand/10 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <p
                    role="status"
                    className="inline-flex max-w-full items-center gap-2 rounded-full border border-sand/10 bg-sand/[0.06] px-3 py-1.5 text-xs font-bold text-sand/70"
                  >
                    <Music2 className="size-3.5 shrink-0 text-saffron" aria-hidden="true" />
                    {composerNotice}
                  </p>
                )}
              </div>
            )}

            {composerNotice && (createMode !== "Advanced" || inputTab !== "Audio" || !selectedAudioFile) && (
              <div className="mt-3">
                <p
                  role="status"
                  className="inline-flex max-w-full items-center gap-2 rounded-full border border-sand/10 bg-sand/[0.06] px-3 py-1.5 text-xs font-bold text-sand/70"
                >
                  <Music2 className="size-3.5 shrink-0 text-saffron" aria-hidden="true" />
                  {composerNotice}
                </p>
              </div>
            )}

            {/* Tab content */}
            {createMode === "Simple" ? (
              <SongDescriptionPanel
                id="song-description"
                label="Song Description"
                value={songDescription}
                importedPrompt={importedPrompt}
                isGenerating={isGenerating}
                isWarning={isSongDescriptionWarning}
                placeholder="Celebration song with Duholl rhythm and bright chorus..."
                suggestionTags={suggestionTags}
                textDir={textDir}
                onChange={handleSongDescriptionChange}
                onRandom={handleSurpriseMe}
                onSuggestionClick={appendSuggestionTag}
                actions={
                  <div className="mt-4 flex items-center justify-between gap-3 border-b border-sand/8 pb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateMode("Advanced")
                        setIsLyricsOpen(true)
                        setLyricsMode("write")
                      }}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-sand/[0.08] px-4 text-sm font-black text-sand transition hover:bg-sand/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      Lyrics
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setLyricsMode((mode) => mode === "instrumental" ? "write" : "instrumental")
                      }
                      aria-pressed={lyricsMode === "instrumental"}
                      className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron ${
                        lyricsMode === "instrumental"
                          ? "border-saffron/35 bg-saffron/12 text-saffron"
                          : "border-sand/10 bg-black/10 text-sand/60 hover:text-sand"
                      }`}
                    >
                      <span
                        className={`size-4 rounded-full border ${
                          lyricsMode === "instrumental"
                            ? "border-saffron bg-saffron shadow-[inset_0_0_0_3px_#171717]"
                            : "border-sand/18 bg-sand/[0.05]"
                        }`}
                        aria-hidden="true"
                      />
                      Instrumental
                    </button>
                  </div>
                }
              />
            ) : (
              <>
                <SongDescriptionPanel
                  id="song-description"
                  label="Song Description"
                  value={songDescription}
                  importedPrompt={importedPrompt}
                  isGenerating={isGenerating}
                  isWarning={isSongDescriptionWarning}
                  placeholder="Celebration song with Duholl rhythm and bright chorus..."
                  suggestionTags={[]}
                  textDir={textDir}
                  onChange={handleSongDescriptionChange}
                  onRandom={handleSurpriseMe}
                  onSuggestionClick={appendSuggestionTag}
                />

                <div className="mt-4 rounded-[1.25rem] border border-sand/8 bg-sand/[0.045] p-3 sm:mt-5 sm:rounded-[1.35rem] sm:p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsLyricsOpen((isOpen) => !isOpen)}
                      aria-expanded={isLyricsOpen}
                      aria-controls="create-lyrics-section"
                      className="flex items-center gap-2 rounded-lg text-sm font-black text-sand transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                    >
                      <ChevronDown
                        className={`size-4 text-sand/70 transition-transform ${isLyricsOpen ? "" : "-rotate-90"}`}
                        aria-hidden="true"
                      />
                      Lyrics
                    </button>
                    {isLyricsOpen && (
                      <div className="ml-auto inline-flex rounded-full bg-black/20 p-1">
                        {(["write", "prompt", "instrumental"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => { setLyricsMode(mode); setPanelNote("") }}
                            aria-pressed={lyricsMode === mode}
                            className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                              lyricsMode === mode
                                ? "bg-sand/12 text-sand"
                                : "text-sand/50 hover:text-sand/75"
                            }`}
                          >
                            {mode === "instrumental" ? "Instrumental" : mode[0].toUpperCase() + mode.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isLyricsOpen && (
                    <div id="create-lyrics-section">
                      <div
                        className={`mt-4 flex flex-col rounded-2xl bg-black/18 p-3 transition-[min-height] duration-300 sm:mt-5 sm:p-4 ${
                          isLyricsExpanded
                            ? "min-h-[540px] sm:min-h-[620px] xl:min-h-[calc(100dvh-190px)]"
                            : "min-h-44 sm:min-h-52"
                        }`}
                      >
                    {lyricsMode === "write" && (
                      <>
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {LYRICS_STRUCTURE_TAGS.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => insertLyricsStructureTag(tag)}
                                disabled={isGenerating}
                                dir="ltr"
                                className="shrink-0 rounded-full bg-sand/[0.08] px-3 py-1.5 text-xs font-black text-sand/72 transition hover:bg-saffron hover:text-[#171717] disabled:opacity-40"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={handleAutoWriteLyrics}
                            disabled={isGenerating || isWritingLyrics}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1.5 text-xs font-black text-saffron transition hover:bg-saffron/16 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                          >
                            {isWritingLyrics ? (
                              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                            ) : (
                              <Sparkles className="size-3.5" aria-hidden="true" />
                            )}
                            <span className="hidden sm:inline">
                              {isWritingLyrics ? "Writing…" : "Write lyrics for me"}
                            </span>
                            <span className="sm:hidden">
                              {isWritingLyrics ? "Writing…" : "Write"}
                            </span>
                          </button>
                        </div>
                        <div className="relative flex flex-1 flex-col">
                          <textarea
                            ref={lyricsTextareaRef}
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                            dir={lyricsDir}
                            disabled={isGenerating || isWritingLyrics}
                            rows={5}
                            placeholder={"[Verse]\nThis is where you write your rhymes\nor give our Magic Wand a try ↙\nSection [tags] can help instruct your\nsongs to feel more tight and structured"}
                            className={`min-h-28 flex-1 resize-none bg-transparent text-[var(--text-body)] leading-6 text-sand outline-none placeholder:text-sand/45 disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-32 sm:text-sm ${
                              lyricsDir === "rtl" ? "text-right" : ""
                            }`}
                          />
                          {isWritingLyrics && (
                            <div
                              role="status"
                              className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/35 backdrop-blur-[1px]"
                            >
                              <span className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-[#1a1a1c] px-3 py-1.5 text-xs font-black text-saffron">
                                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                Writing lyrics…
                              </span>
                            </div>
                          )}
                        </div>
                        <p
                          dir="ltr"
                          className="mt-1.5 text-right text-[11px] font-semibold tabular-nums text-sand/38"
                        >
                          {lyricsWordCount} {lyricsWordCount === 1 ? "word" : "words"} ·{" "}
                          {lyricsCharCount} {lyricsCharCount === 1 ? "character" : "characters"}
                        </p>
                      </>
                    )}

                    {lyricsMode === "prompt" && (
                      <textarea
                        value={lyricsPrompt}
                        onChange={(e) => setLyricsPrompt(e.target.value)}
                        dir={lyricsDir}
                        disabled={isGenerating}
                        rows={5}
                        placeholder={"What do you want your lyrics to be about? Suno will write\nnew lyrics every generation. Leave this blank for a random\ntopic."}
                        className={`min-h-28 flex-1 resize-none bg-transparent text-[var(--text-body)] leading-6 text-sand outline-none placeholder:text-sand/45 disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-32 sm:text-sm ${
                          lyricsDir === "rtl" ? "text-right" : ""
                        }`}
                      />
                    )}

                    {lyricsMode === "instrumental" && (
                      <div className="flex min-h-28 flex-1 items-start rounded-xl bg-sand/[0.055] px-4 py-3 text-sm font-semibold leading-6 text-sand/72 sm:min-h-32">
                        This song will be instrumental, with no vocals or lyrics.
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPanelNote("Use the Write, Prompt, or Instrumental tabs to shape lyrics.")}
                          className="inline-flex size-10 items-center justify-center rounded-full bg-sand/[0.07] text-sand/58 transition hover:bg-sand/[0.12] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                          aria-label="Lyrics settings"
                        >
                          <SlidersHorizontal className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={handleWand}
                          className="inline-flex size-10 items-center justify-center rounded-full bg-sand/[0.07] text-sand/58 transition hover:bg-saffron hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                          aria-label="Generate lyric idea"
                        >
                          <Wand2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="h-1 w-14 rounded-full bg-sand/28" aria-hidden="true" />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsLyricsExpanded((isExpanded) => !isExpanded)}
                          aria-pressed={isLyricsExpanded}
                          className={`inline-flex size-10 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron ${
                            isLyricsExpanded
                              ? "bg-sand text-[#171717] hover:bg-white"
                              : "bg-sand/[0.07] text-sand/58 hover:bg-sand/[0.12] hover:text-sand"
                          }`}
                          aria-label={isLyricsExpanded ? "Collapse lyrics editor" : "Expand lyrics editor"}
                        >
                          <Maximize2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                      </div>

                      {panelNote && (
                        <p role="status" className="mt-3 rounded-lg border border-saffron/25 bg-saffron/10 px-3 py-1.5 text-xs font-semibold text-saffron">
                          {panelNote}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Styles section */}
                <div className="mt-3 rounded-[1.25rem] border border-sand/8 bg-sand/[0.045] p-3 sm:mt-4 sm:rounded-[1.35rem] sm:p-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsStylesOpen((isOpen) => !isOpen)}
                      aria-expanded={isStylesOpen}
                      aria-controls="create-styles-section"
                      className="flex items-center gap-2 rounded-lg text-sm font-black text-sand transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                    >
                      <ChevronDown
                        className={`size-4 text-sand/70 transition-transform ${isStylesOpen ? "" : "-rotate-90"}`}
                        aria-hidden="true"
                      />
                      Styles / instruments
                    </button>
                    {importedPrompt && (
                      <span className="ml-auto text-[var(--text-micro)] font-bold uppercase tracking-wide text-saffron/70">
                        Prompt imported from Dashboard
                      </span>
                    )}
                  </div>
                  {isStylesOpen && (
                    <div id="create-styles-section" className="mt-3 flex min-h-36 flex-col rounded-2xl bg-black/18 p-3 sm:mt-4 sm:min-h-44 sm:p-4">
                    <textarea
                      value={stylePrompt}
                      onChange={(e) => { setStylePrompt(e.target.value); setImportedPrompt(false) }}
                      disabled={isGenerating}
                      rows={4}
                      placeholder="Suroz, Benju, Rabab, Duholl, Dambora, Makkuran vocal, coastal folk"
                      className="min-h-24 flex-1 resize-none bg-transparent text-[var(--text-body)] leading-6 text-sand outline-none placeholder:text-sand/45 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                    />

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPanelNote("Use style chips or type your target styles.")}
                        className="inline-flex size-10 items-center justify-center rounded-full bg-sand/[0.07] text-sand/58 transition hover:bg-sand/[0.12] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                        aria-label="Style library"
                      >
                        <SlidersHorizontal className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setStylePrompt((value) =>
                            value ? `${value}, Suroz` : "Suroz",
                          )
                        }
                        disabled={isGenerating}
                        className="inline-flex size-10 items-center justify-center rounded-full bg-saffron text-[#171717] transition hover:bg-[#f09a4f] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                        aria-label="Generate style idea"
                      >
                        <Wand2 className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setStylePrompt("")}
                        disabled={isGenerating}
                        className="inline-flex size-10 items-center justify-center rounded-full bg-sand/[0.07] text-sand/58 transition hover:bg-sand/[0.12] hover:text-sand disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                        aria-label="Refresh styles"
                      >
                        <RefreshCw className="size-4" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Icon-first style options — names exposed via aria-label/title */}
                    <div className="mt-3 flex flex-wrap gap-2 sm:gap-2.5">
                      {ADVANCED_STYLE_CHIPS.map((chip) => {
                        const isActive = activeStyleTokens.has(chip.label.toLowerCase())
                        return (
                          <button
                            key={chip.label}
                            type="button"
                            onClick={() => toggleStyleChip(chip.label)}
                            disabled={isGenerating}
                            aria-label={chip.label}
                            aria-pressed={isActive}
                            title={chip.label}
                            className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron disabled:cursor-not-allowed disabled:opacity-40 ${
                              isActive
                                ? "border-saffron bg-saffron text-[#171717] shadow-[0_8px_20px_rgba(227,122,44,0.22)]"
                                : "border-sand/10 bg-sand/[0.07] text-saffron/80 hover:border-saffron/40 hover:text-saffron"
                            }`}
                          >
                            <StyleChipGlyph icon={chip.icon} />
                          </button>
                        )
                      })}
                    </div>
                    </div>
                  )}
                </div>

                {/* More Options section */}
                <div className="mt-3 rounded-[1.25rem] border border-sand/8 bg-sand/[0.045] p-3 sm:mt-4 sm:rounded-[1.35rem] sm:p-4">
                  <button
                    type="button"
                    onClick={() => setIsMoreOptionsOpen((isOpen) => !isOpen)}
                    aria-expanded={isMoreOptionsOpen}
                    aria-controls="create-more-options-section"
                    className="flex items-center gap-2 rounded-lg text-sm font-black text-sand transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                  >
                    <ChevronDown
                      className={`size-4 text-sand/70 transition-transform ${isMoreOptionsOpen ? "" : "-rotate-90"}`}
                      aria-hidden="true"
                    />
                    More options
                  </button>

                  {isMoreOptionsOpen && (
                    <div id="create-more-options-section" className="mt-4 grid gap-2 rounded-2xl bg-black/18 p-2">
                      <VocalGenderControl
                        value={vocalGender}
                        disabled={isGenerating}
                        onChange={setVocalGender}
                      />
                      <ComposerSlider
                        label="Weirdness"
                        value={weirdness}
                        onChange={setWeirdness}
                      />
                      <ComposerSlider
                        label="Style Influence"
                        value={styleInfluence}
                        onChange={setStyleInfluence}
                      />
                      <GenerationSettingsPanel
                        bpm={bpm}
                        duration={selectedDuration}
                        embedded
                        isGenerating={isGenerating}
                        musicKey={musicKey}
                        totalCreditCost={totalCreditCost}
                        variationCount={variationCount}
                        onBpmChange={setBpm}
                        onDurationChange={setSelectedDuration}
                        onKeyChange={setMusicKey}
                        onVariationChange={setVariationCount}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-b border-sand/8 pb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLyricsOpen(true)
                      setLyricsMode("write")
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-sand/[0.08] px-4 text-sm font-black text-sand transition hover:bg-sand/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Lyrics
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setLyricsMode((mode) => (mode === "instrumental" ? "write" : "instrumental"))
                    }
                    aria-pressed={lyricsMode === "instrumental"}
                    className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron ${
                      lyricsMode === "instrumental"
                        ? "border-saffron/35 bg-saffron/12 text-saffron"
                        : "border-sand/10 bg-black/10 text-sand/60 hover:text-sand"
                    }`}
                  >
                    <span
                      className={`size-4 rounded-full border ${
                        lyricsMode === "instrumental"
                          ? "border-saffron bg-saffron shadow-[inset_0_0_0_3px_#171717]"
                          : "border-sand/18 bg-sand/[0.05]"
                      }`}
                      aria-hidden="true"
                    />
                    Instrumental
                  </button>
                </div>

                <div className="mt-3 rounded-[1.25rem] border border-sand/8 bg-sand/[0.045] p-3 sm:mt-4 sm:rounded-[1.35rem] sm:p-4">
                  <SuggestionTags
                    tags={suggestionTags}
                    isGenerating={isGenerating}
                    onClick={appendSuggestionTag}
                  />
                </div>

                <div className="mt-3 overflow-hidden rounded-[1.25rem] border border-sand/8 bg-sand/[0.045] sm:mt-4 sm:rounded-[1.35rem]">
                  <label className="flex h-14 items-center gap-3 px-4">
                    <Music2 className="size-4 shrink-0 text-sand/72" aria-hidden="true" />
                    <span className="sr-only">Song title</span>
                    <input
                      type="text"
                      value={songTitle}
                      onChange={(event) => setSongTitle(event.target.value)}
                      disabled={isGenerating}
                      placeholder="Song Title (Optional)"
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-sand outline-none placeholder:text-sand/35 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </label>

                  <div className="flex min-h-14 items-center gap-3 border-t border-sand/8 px-4">
                    <Folder className="size-4 shrink-0 text-sand/72" aria-hidden="true" />
                    <span className="text-sm font-black text-sand">Save to...</span>
                    <button
                      type="button"
                      onClick={() => setComposerNotice("Tracks will save to My Workspace.")}
                      className="ml-auto rounded-full bg-sand/[0.08] px-4 py-2 text-xs font-black text-sand transition hover:bg-sand/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                    >
                      My Workspace
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Bottom: progress + create */}
            <div className="mt-4 rounded-2xl border border-sand/10 bg-[#181818]/96 p-2 sm:mt-5 lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0 lg:pt-5">
              <GenerationProgress
                status={status}
                progress={progress}
                isGenerating={isGenerating}
                stageIndex={stageIndex}
              />

              <p className="mt-2 text-center text-xs font-bold text-sand/48 sm:mt-3">
                You have {USER_CREDITS} credits remaining
              </p>

              <div className="mt-2 flex items-center gap-2 sm:gap-3">
                {createMode === "Advanced" && (
                  <button
                    type="button"
                    onClick={() => {
                      setLyrics("")
                      setLyricsPrompt("")
                      setSongDescription("")
                      setStylePrompt("")
                      setSongTitle("")
                      setLanguage("english")
                      setSelectedDuration("2min")
                      setVariationCount(2)
                      setBpm(100)
                      setMusicKey("Auto")
                      setVocalGender("male")
                      setWeirdness(50)
                      setStyleInfluence(50)
                      setImportedPrompt(false)
                      setComposerNotice("")
                      setSelectedAudioFile(null)
                      if (audioInputRef.current) {
                        audioInputRef.current.value = ""
                      }
                    }}
                    className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-sand/[0.08] text-sand/60 transition hover:bg-sand/[0.12] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron sm:size-14"
                    aria-label="Clear composer"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!canCreate}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-saffron text-base font-black text-[#171717] shadow-[0_14px_34px_rgba(227,122,44,0.22)] transition hover:bg-[#f09a4f] disabled:cursor-not-allowed disabled:border disabled:border-sand/15 disabled:bg-sand/[0.12] disabled:text-sand/55 disabled:shadow-none sm:h-14"
                >
                  {isGenerating ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Music2 className="size-4" aria-hidden="true" />
                  )}
                  {isGenerating ? "Generating..." : `Generate — ${totalCreditCost} credits`}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── RIGHT PANEL (Workspace) ── */}
        <section className="flex flex-col rounded-2xl border border-sand/10 bg-[#111111]/82 shadow-[0_20px_60px_rgba(0,0,0,0.26)] lg:h-full lg:min-h-0 lg:rounded-none lg:border-0 lg:bg-transparent">
          <div className="flex min-h-0 flex-1 flex-col px-4 py-5 sm:px-5 sm:py-6 lg:overflow-y-auto lg:px-6 lg:py-7 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
            <div className="flex flex-wrap items-center gap-2 text-lg font-black">
              <span>Workspaces</span>
              <ChevronRight className="size-4 text-sand/35" aria-hidden="true" />
              <span className="text-sand/68">My Workspace</span>
            </div>

            {/* Workspace toolbar */}
            <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-7">
              <label className="relative min-w-0 flex-[1_1_100%] sm:flex-[1_1_220px]">
                <span className="sr-only">Search workspace</span>
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-sand/45"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search"
                  className="h-12 w-full rounded-full border border-sand/7 bg-sand/[0.055] pl-12 pr-4 text-sm font-semibold text-sand outline-none placeholder:text-sand/42 focus:border-saffron/35"
                />
              </label>

              <button
                type="button"
                onClick={() => setToolbarNote("Filters are inactive for local mock tracks.")}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-sand/[0.08] px-4 text-sm font-black text-sand transition hover:bg-sand/[0.12] sm:h-12 sm:flex-none"
              >
                <Filter className="size-4" aria-hidden="true" />
                Filters
                <ChevronDown className="size-4 text-sand/55" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setSortLabel((v) => v === "Newest" ? "Oldest" : "Newest")}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-sand/[0.08] px-4 text-sm font-black text-sand transition hover:bg-sand/[0.12] sm:h-12 sm:flex-none"
              >
                {sortLabel}
                <ChevronDown className="size-4 text-sand/55" aria-hidden="true" />
              </button>

              {["Liked", "Public", "Uploads"].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setToolbarNote(`${chip} filter is inactive for local mock tracks.`)}
                  className="h-11 flex-1 rounded-full border border-sand/10 px-3 text-sm font-black text-sand transition hover:border-saffron/28 sm:h-12 sm:flex-none sm:px-4"
                >
                  {chip}
                </button>
              ))}

              {/* Pagination — single page, disabled */}
              <div className="ml-0 flex items-center gap-2 sm:ml-auto">
                <button
                  type="button"
                  disabled
                  className="inline-flex size-11 items-center justify-center rounded-full bg-sand/[0.08] text-sand/30"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </button>
                <span className="inline-flex h-11 min-w-16 items-center justify-center rounded-full border border-sand/10 text-sm font-black">
                  1
                </span>
                <button
                  type="button"
                  disabled
                  className="inline-flex size-11 items-center justify-center rounded-full bg-sand/[0.08] text-sand/30"
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {toolbarNote && (
              <p role="status" className="mt-3 max-w-sm rounded-lg border border-saffron/25 bg-saffron/10 px-3 py-1.5 text-xs font-semibold text-saffron">
                {toolbarNote}
              </p>
            )}

            {isGenerating && activeGeneration && (
              <GenerationJobCard
                elapsedSeconds={generationElapsedSeconds}
                pendingGeneration={activeGeneration}
                onCancel={handleCancelGeneration}
              />
            )}

            {/* Generated songs */}
            <div className="flex flex-1 flex-col">
              {generatedSongs.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-24 text-center">
                  <div className="flex flex-col items-center">
                    <span className="flex size-14 items-center justify-center rounded-2xl border border-saffron/20 bg-saffron/[0.08] text-saffron">
                      <Music2 className="size-7" aria-hidden="true" />
                    </span>
                    <p className="mt-5 text-base font-black text-sand/72">No tracks yet</p>
                    <p className="mt-2 max-w-xs text-sm font-semibold text-sand/40">
                      Describe your song on the left and generate your first Makkuran track.
                    </p>
                    <button
                      type="button"
                      onClick={handleStartCreating}
                      className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-saffron px-5 text-sm font-black text-[#171717] shadow-[0_12px_30px_rgba(227,122,44,0.2)] transition hover:bg-[#f09a4f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                    >
                      <Sparkles className="size-4" aria-hidden="true" />
                      Start creating
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid gap-3">
                  {generatedSongs.map((song) => {
                    const playerSong = toPlayerSong(song)
                    const active = isCurrentSong(playerSong)
                    const playing = active && isPlaying
                    const isLiked = likedIds.has(song.id)

                    return (
                      <GeneratedTrackCard
                        key={song.id}
                        isLiked={isLiked}
                        playing={playing}
                        song={song}
                        onCopyLink={() => handleCopyTrackLink(song)}
                        onDelete={() => handleDeleteTrack(song.id)}
                        onDownload={handleTrackDownload}
                        onPlay={() => handlePlay(song)}
                        onRemix={() => handleRemixTrack(song)}
                        onRename={(title) => handleRenameTrack(song.id, title)}
                        onToggleLiked={() => toggleLiked(song.id)}
                      />
                    )
                  })}
                </div>
              )}
            </div>

            {/* Challenges temporarily hidden for MVP frontend polish. */}
          </div>
        </section>
      </main>
    </div>
  )
}

function GeneratedTrackCard({
  isLiked,
  onCopyLink,
  onDelete,
  onDownload,
  onPlay,
  onRemix,
  onRename,
  onToggleLiked,
  playing,
  song,
}: {
  isLiked: boolean
  onCopyLink: () => Promise<void>
  onDelete: () => void
  onDownload: (format: TrackDownloadFormat) => void
  onPlay: () => void
  onRemix: () => void
  onRename: (title: string) => void
  onToggleLiked: () => void
  playing: boolean
  song: GeneratedSong
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [titleDraft, setTitleDraft] = useState(song.title)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = `track-actions-${song.id}`

  useEffect(() => {
    if (!isMenuOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isMenuOpen])

  function openTitleEditor() {
    setTitleDraft(song.title)
    setIsEditingTitle(true)
    setIsConfirmingDelete(false)
    setIsMenuOpen(false)
  }

  function handleTitleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextTitle = titleDraft.trim()
    if (!nextTitle) return

    onRename(nextTitle)
    setIsEditingTitle(false)
  }

  function cancelTitleEdit() {
    setTitleDraft(song.title)
    setIsEditingTitle(false)
  }

  function requestDelete() {
    setIsEditingTitle(false)
    setIsConfirmingDelete(true)
    setIsMenuOpen(false)
  }

  function confirmDelete() {
    setIsConfirmingDelete(false)
    onDelete()
  }

  async function handleCopyLink() {
    setIsMenuOpen(false)
    await onCopyLink()
  }

  function handleDownload(format: TrackDownloadFormat) {
    setIsMenuOpen(false)
    onDownload(format)
  }

  return (
    <article className="group rounded-2xl border border-sand/8 bg-sand/[0.045] p-3 transition hover:border-saffron/20 hover:bg-sand/[0.065]">
      <div className="flex items-center gap-3">
        <span
          className="relative size-12 shrink-0 overflow-hidden rounded-xl shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
          style={{ backgroundImage: coverGradient(song.id) }}
        >
          <span
            className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={onPlay}
            aria-label={`${playing ? "Pause" : "Play"} ${song.title}`}
            className="absolute inset-0 flex items-center justify-center text-white transition hover:bg-black/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-saffron"
          >
            {playing ? (
              <Pause className="size-5 fill-current" aria-hidden="true" />
            ) : (
              <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
            )}
          </button>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-black text-sand">
              {song.title}
            </h2>
            <span className="rounded-full border border-saffron/20 bg-saffron/8 px-2 py-0.5 text-[var(--text-micro)] font-black uppercase tracking-[0.12em] text-saffron">
              {song.dialect}
            </span>
          </div>
          <p className="mt-1 truncate text-xs font-semibold text-sand/45">
            {formatSongDate(song.createdAt)} | {song.duration} | {song.bpm} BPM | {song.musicKey}
          </p>
        </div>

        <div className="hidden h-10 flex-1 items-end gap-px md:flex" aria-hidden="true">
          {Array.from({ length: 46 }, (_, i) => (
            <span
              key={i}
              className={`w-full rounded-full ${
                i < 18 ? "bg-saffron/70" : "bg-sand/20"
              }`}
              style={{ height: `${8 + ((i * 13 + 9) % 28)}px` }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-sand/45">
          <span className="hidden tabular-nums sm:inline">{song.duration}</span>
          <button
            type="button"
            onClick={onToggleLiked}
            aria-label={isLiked ? "Unlike song" : "Like song"}
            aria-pressed={isLiked}
            className={`inline-flex size-9 items-center justify-center rounded-full transition ${
              isLiked
                ? "bg-saffron/15 text-saffron"
                : "text-sand/45 hover:bg-sand/8 hover:text-sand"
            }`}
          >
            <Heart className={`size-4 ${isLiked ? "fill-current" : ""}`} aria-hidden="true" />
          </button>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen((open) => !open)
                setIsConfirmingDelete(false)
              }}
              aria-controls={menuId}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              aria-label={`Open actions for ${song.title}`}
              title={`Open actions for ${song.title}`}
              className="inline-flex size-9 items-center justify-center rounded-full text-sand/45 transition hover:bg-sand/8 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </button>

            {isMenuOpen && (
              <div
                id={menuId}
                role="menu"
                aria-label={`Actions for ${song.title}`}
                className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-sand/12 bg-[#111113] p-1.5 text-left text-sm font-bold text-sand shadow-[0_18px_44px_rgba(0,0,0,0.45)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false)
                    onPlay()
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sand/88 transition hover:bg-sand/10 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                >
                  {playing ? "Pause" : "Play"}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={openTitleEditor}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sand/88 transition hover:bg-sand/10 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                >
                  Edit title
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false)
                    onRemix()
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sand/88 transition hover:bg-sand/10 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                >
                  Remix
                </button>

                <div className="my-1 border-y border-sand/8 py-1">
                  <p className="px-3 py-1 text-[var(--text-micro)] font-black uppercase tracking-[0.14em] text-sand/42">
                    Download
                  </p>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {(["MP3", "WAV"] as const).map((format) => (
                      <button
                        key={format}
                        type="button"
                        role="menuitem"
                        onClick={() => handleDownload(format)}
                        className="rounded-lg px-2.5 py-2 text-xs font-black text-sand/76 transition hover:bg-sand/10 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    void handleCopyLink()
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sand/88 transition hover:bg-sand/10 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                >
                  Copy link
                </button>

                <div className="my-1 border-y border-sand/8 py-1">
                  {TRACK_ACTIONS_COMING_SOON.map((action) => (
                    <button
                      key={action}
                      type="button"
                      role="menuitem"
                      disabled
                      aria-disabled="true"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sand/28"
                    >
                      {action}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={requestDelete}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[#ff9585] transition hover:bg-[#ff9585]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9585]"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditingTitle && (
        <form
          onSubmit={handleTitleSubmit}
          className="mt-3 rounded-2xl border border-sand/10 bg-black/18 p-3"
        >
          <label className="text-xs font-black uppercase tracking-[0.14em] text-sand/42">
            Edit title
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              autoFocus
              className="min-h-10 min-w-0 flex-1 rounded-full border border-sand/10 bg-sand/[0.055] px-3 text-sm font-semibold text-sand outline-none placeholder:text-sand/35 focus:border-saffron/35"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!titleDraft.trim()}
                className="h-10 rounded-full bg-saffron px-4 text-xs font-black text-[#171717] transition hover:bg-[#f09a4f] disabled:cursor-not-allowed disabled:bg-sand/12 disabled:text-sand/42"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelTitleEdit}
                className="h-10 rounded-full bg-sand/[0.08] px-4 text-xs font-black text-sand/70 transition hover:bg-sand/[0.12] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {isConfirmingDelete && (
        <div className="mt-3 rounded-2xl border border-[#ff9585]/20 bg-[#ff9585]/10 p-3">
          <p className="text-sm font-black text-sand">Delete this track?</p>
          <p className="mt-1 text-xs font-semibold text-sand/48">
            This only removes the local mock track from this workspace.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirmDelete}
              className="h-9 rounded-full bg-[#ff9585] px-4 text-xs font-black text-[#171717] transition hover:bg-[#ffad9f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9585]"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              className="h-9 rounded-full bg-sand/[0.08] px-4 text-xs font-black text-sand/70 transition hover:bg-sand/[0.12] hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

// ── Custom Balochi instrument/style icons (inline SVG, inherit currentColor) ──
// Hand-drawn line glyphs so each style reads as a distinct, real instrument
// rather than a generic Lucide shape.

type StyleIconProps = { className?: string }

const SVG_BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
}

// Suroz — bowed spike fiddle: round body, long neck, bow across the strings
function SurozIcon({ className }: StyleIconProps) {
  return (
    <svg className={className} {...SVG_BASE}>
      <circle cx="7.5" cy="16.3" r="3.4" />
      <path d="M9.9 13.9 18.5 5.3" />
      <path d="M17.6 4.4 19.8 6.6" />
      <path d="M3.6 11.4 20.4 17" />
    </svg>
  )
}

// Benju — keyed box zither: a body with a row of keys/buttons and a string
function BenjuIcon({ className }: StyleIconProps) {
  return (
    <svg className={className} {...SVG_BASE}>
      <rect x="3" y="9" width="18" height="8" rx="1.8" />
      <circle cx="7" cy="13" r="1" />
      <circle cx="10.5" cy="13" r="1" />
      <circle cx="14" cy="13" r="1" />
      <path d="M17.5 11v4" />
    </svg>
  )
}

// Rabab — short-necked lute: rounded body with sound hole, short pegged neck
function RababIcon({ className }: StyleIconProps) {
  return (
    <svg className={className} {...SVG_BASE}>
      <circle cx="8.6" cy="16.4" r="4.3" />
      <circle cx="8.6" cy="16.4" r="1.3" />
      <path d="M11.3 13.2 16.8 7.4" />
      <path d="M15.9 6.5 18 8.6" />
      <path d="M17.4 5 19.5 7.1" />
    </svg>
  )
}

// Duholl — double-headed barrel drum with diagonal rope lacing
function DuhollIcon({ className }: StyleIconProps) {
  return (
    <svg className={className} {...SVG_BASE}>
      <rect x="3.3" y="8.5" width="17.4" height="7" rx="3.5" />
      <path d="M4.4 9.2 6.8 14.8" />
      <path d="M8.4 8.6 10.8 15.4" />
      <path d="M12.4 8.6 14.8 15.4" />
      <path d="M16.4 9 18.6 14.6" />
    </svg>
  )
}

// Dambora — long-necked two-string lute: small body, very long neck, 2 strings
function DamboraIcon({ className }: StyleIconProps) {
  return (
    <svg className={className} {...SVG_BASE}>
      <circle cx="7.2" cy="17" r="3.2" />
      <path d="M9.2 14.6 18.7 5.1" />
      <path d="M8.3 13.7 17.8 4.2" />
      <path d="M18 4 20 6" />
    </svg>
  )
}

// Makkuran vocal — a singer with sound waves projecting from the voice
function MakkuranVocalIcon({ className }: StyleIconProps) {
  return (
    <svg className={className} {...SVG_BASE}>
      <circle cx="8.5" cy="7" r="3" />
      <path d="M3.8 19c0-3 2.1-4.8 4.7-4.8 1.5 0 2.8.6 3.6 1.6" />
      <path d="M16 7.2c1.1 1.4 1.1 3.9 0 5.3" />
      <path d="M18.7 5c1.9 2.4 1.9 6.9 0 9.3" />
    </svg>
  )
}

// Coastal folk — layered sea waves under a low sun
function CoastalFolkIcon({ className }: StyleIconProps) {
  return (
    <svg className={className} {...SVG_BASE}>
      <circle cx="17" cy="6.6" r="2.4" />
      <path d="M3 13.5q2.25-2.2 4.5 0t4.5 0 4.5 0 4.5 0" />
      <path d="M3 17.5q2.25-2.2 4.5 0t4.5 0 4.5 0 4.5 0" />
    </svg>
  )
}

function StyleChipGlyph({ icon, className = "size-5" }: { icon: StyleChipIconKind; className?: string }) {
  switch (icon) {
    case "suroz":
      return <SurozIcon className={className} />
    case "benju":
      return <BenjuIcon className={className} />
    case "rabab":
      return <RababIcon className={className} />
    case "duholl":
      return <DuhollIcon className={className} />
    case "dambora":
      return <DamboraIcon className={className} />
    case "vocal":
      return <MakkuranVocalIcon className={className} />
    case "coastal":
      return <CoastalFolkIcon className={className} />
  }
}

function ComposerSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-xl bg-black/30 px-3 py-2 sm:flex sm:py-0">
      <label className="flex min-w-0 items-center gap-1.5 text-xs font-black text-sand sm:w-24 sm:shrink-0">
        {label}
        <Info className="size-3 text-sand/45" aria-hidden="true" />
      </label>
      <div className="relative col-span-2 min-w-0 flex-1 sm:col-span-1">
        <div
          className="pointer-events-none absolute left-0 right-0 top-1/2 h-5 -translate-y-1/2 opacity-45"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, transparent 0, transparent 11px, rgba(237,227,211,0.34) 12px, rgba(237,227,211,0.34) 13px)",
          }}
          aria-hidden="true"
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={label}
          className="relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent accent-[#e37a2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
          style={{
            background: `linear-gradient(to right, transparent 0%, transparent ${value}%, transparent ${value}%, transparent 100%)`,
          }}
        />
      </div>
      <span className="w-9 text-right text-xs font-black tabular-nums text-sand">
        {value}%
      </span>
    </div>
  )
}

function VocalGenderControl({
  disabled = false,
  onChange,
  value,
}: {
  disabled?: boolean
  onChange: (gender: VocalGender) => void
  value: VocalGender
}) {
  return (
    <div className="flex min-h-12 items-center gap-3 rounded-xl bg-black/30 px-3">
      <div className="flex min-w-0 items-center gap-1.5 text-xs font-black text-sand">
        Vocal Gender
        <Info className="size-3 text-sand/45" aria-hidden="true" />
      </div>
      <div className="ml-auto inline-flex rounded-full bg-sand/[0.04] p-1">
        {(["male", "female"] as const).map((gender) => (
          <button
            key={gender}
            type="button"
            onClick={() => onChange(gender)}
            disabled={disabled}
            aria-pressed={value === gender}
            className={`rounded-full px-3 py-1.5 text-xs font-black capitalize transition disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron ${
              value === gender
                ? "bg-sand/14 text-sand"
                : "text-sand/42 hover:text-sand/72"
            }`}
          >
            {gender}
          </button>
        ))}
      </div>
    </div>
  )
}

function CreateAudioOptionsMenu({
  onBrowse,
  onUpload,
  onRecord,
}: {
  onBrowse: () => void
  onUpload: () => void
  onRecord: () => void
}) {
  return (
    <div
      id="create-audio-options-menu"
      role="menu"
      aria-label="Audio options"
      className="absolute left-0 top-full z-50 mt-2 w-44 max-w-[calc(100vw-2rem)] rounded-xl border border-sand/12 bg-[#111113] p-1.5 text-left text-sm font-bold text-sand shadow-[0_18px_44px_rgba(0,0,0,0.45)]"
    >
      <button
        type="button"
        role="menuitem"
        onClick={onBrowse}
        className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sand/88 transition hover:bg-sand/10 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
      >
        <FolderSearch className="size-4 text-sand/65 transition group-hover:text-saffron" aria-hidden="true" />
        Browse
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={onUpload}
        className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sand/88 transition hover:bg-sand/10 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
      >
        <Upload className="size-4 text-sand/65 transition group-hover:text-saffron" aria-hidden="true" />
        Upload
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={onRecord}
        className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sand/88 transition hover:bg-sand/10 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
      >
        <Mic2 className="size-4 text-sand/65 transition group-hover:text-saffron" aria-hidden="true" />
        Record
      </button>
    </div>
  )
}

function TrackInput({
  generatedTracks,
  initialSelectedTrackId,
  isGenerating,
  onDurationDetected,
  onReferenceAccepted,
}: {
  generatedTracks: GeneratedSong[]
  initialSelectedTrackId: string | null
  isGenerating: boolean
  onDurationDetected?: (option: DurationOption) => void
  onReferenceAccepted?: () => void
}) {
  const [activeTab, setActiveTab] = useState<TrackInputTab>(
    initialSelectedTrackId ? "workspace" : "upload",
  )
  const [selectedUpload, setSelectedUpload] = useState<File | null>(null)
  const [selectedWorkspaceTrackId, setSelectedWorkspaceTrackId] =
    useState<string | null>(initialSelectedTrackId)
  const [externalReferenceId, setExternalReferenceId] = useState<string | null>(
    initialSelectedTrackId &&
      !generatedTracks.some((track) => track.id === initialSelectedTrackId) &&
      MOCK_REFERENCE_TRACKS[initialSelectedTrackId]
      ? initialSelectedTrackId
      : null,
  )
  const [playingReferenceId, setPlayingReferenceId] = useState<string | null>(null)
  const [fileError, setFileError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const externalReference = externalReferenceId
    ? MOCK_REFERENCE_TRACKS[externalReferenceId]
    : null
  const selectedWorkspaceTrack =
    generatedTracks.find((track) => track.id === selectedWorkspaceTrackId) ?? null
  const selectedReference = selectedUpload
    ? {
        detail: `Upload | ${formatFileSize(selectedUpload.size)}`,
        duration: TRACK_INPUT_PLACEHOLDER_DURATION,
        id: "uploaded-reference",
        removable: true,
        sourceLabel: "Uploaded track",
        title: selectedUpload.name,
      }
    : selectedWorkspaceTrack
      ? {
          detail: `Workspace | ${formatSongDate(selectedWorkspaceTrack.createdAt)}`,
          duration: selectedWorkspaceTrack.duration,
          id: `workspace-${selectedWorkspaceTrack.id}`,
          removable: false,
          sourceLabel: "Workspace track",
          title: selectedWorkspaceTrack.title,
        }
      : externalReference
        ? {
            detail: "Reference | Loaded from link",
            duration: externalReference.duration,
            id: `external-${externalReferenceId}`,
            removable: false,
            sourceLabel: "Reference track",
            title: externalReference.title,
          }
        : null

  function togglePlaying(referenceId: string) {
    setPlayingReferenceId((current) =>
      current === referenceId ? null : referenceId,
    )
  }

  function clearFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const extension = file.name.split(".").pop()?.toLowerCase() ?? ""

    if (!TRACK_INPUT_ALLOWED_EXTENSIONS.has(extension)) {
      setFileError("Use an MP3, WAV, FLAC, or M4A file.")
      setSelectedUpload(null)
      clearFileInput()
      return
    }

    if (file.size > TRACK_INPUT_MAX_SIZE_BYTES) {
      setFileError(
        `Choose a file under ${TRACK_INPUT_MAX_SIZE_LABEL}. This file is ${formatFileSize(file.size)}.`,
      )
      setSelectedUpload(null)
      clearFileInput()
      return
    }

    setFileError("")
    setSelectedUpload(file)
    setSelectedWorkspaceTrackId(null)
    setExternalReferenceId(null)
    setPlayingReferenceId(null)
    onReferenceAccepted?.()

    // Quick win: probe the uploaded file's length and auto-fill the duration
    // selector with the nearest preset (the user can still override it).
    if (onDurationDetected) {
      const probeUrl = URL.createObjectURL(file)
      const probe = new Audio()
      probe.preload = "metadata"
      probe.onloadedmetadata = () => {
        if (Number.isFinite(probe.duration) && probe.duration > 0) {
          onDurationDetected(durationOptionFromSeconds(probe.duration))
        }
        URL.revokeObjectURL(probeUrl)
      }
      probe.onerror = () => URL.revokeObjectURL(probeUrl)
      probe.src = probeUrl
    }
  }

  function handleRemoveUpload() {
    setSelectedUpload(null)
    setPlayingReferenceId(null)
    setFileError("")
    clearFileInput()
  }

  function handleSelectWorkspaceTrack(trackId: string) {
    setSelectedWorkspaceTrackId(trackId)
    setSelectedUpload(null)
    setExternalReferenceId(null)
    setFileError("")
    setPlayingReferenceId(null)
    clearFileInput()
    onReferenceAccepted?.()

    // Quick win: auto-fill the duration selector from the chosen track length.
    const track = generatedTracks.find((item) => item.id === trackId)
    const seconds = track ? parseClockToSeconds(track.duration) : null
    if (seconds != null) {
      onDurationDetected?.(durationOptionFromSeconds(seconds))
    }
  }

  return (
    <div className="mt-4 rounded-[1.35rem] border border-sand/8 bg-sand/[0.045] p-3 sm:mt-5 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Upload className="size-4 shrink-0 text-saffron" aria-hidden="true" />
          <span className="text-sm font-black text-sand/82">Track reference</span>
        </div>
        <span className="ml-auto text-[var(--text-micro)] font-black uppercase tracking-[0.12em] text-sand/42">
          Max {TRACK_INPUT_MAX_SIZE_LABEL} | Max {TRACK_INPUT_MAX_DURATION_LABEL}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 rounded-full border border-sand/8 bg-black/18 p-1">
        {(["upload", "workspace"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            className={`h-9 rounded-full text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron ${
              activeTab === tab
                ? "bg-sand/12 text-sand"
                : "text-sand/50 hover:text-sand/75"
            }`}
          >
            {tab === "upload" ? "Upload" : "My Studio"}
          </button>
        ))}
      </div>

      {activeTab === "upload" ? (
        <div className="mt-3">
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-sand/14 bg-black/18 px-4 py-5 text-center transition hover:border-saffron/35 hover:bg-saffron/[0.045]">
            <input
              ref={fileInputRef}
              type="file"
              accept={TRACK_INPUT_ACCEPT}
              disabled={isGenerating}
              className="sr-only"
              onChange={handleUploadChange}
            />
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-saffron/12 text-saffron">
              <Upload className="size-5" aria-hidden="true" />
            </span>
            <span className="mt-3 text-sm font-black text-sand">
              Upload reference track
            </span>
            <span className="mt-1 text-xs font-semibold text-sand/45">
              MP3, WAV, FLAC, or M4A
            </span>
          </label>
          {fileError && (
            <p role="alert" className="mt-2 rounded-lg border border-saffron/25 bg-saffron/10 px-3 py-1.5 text-xs font-semibold text-saffron">
              {fileError}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-3 grid gap-2">
          {generatedTracks.length === 0 ? (
            <div className="rounded-2xl border border-sand/8 bg-black/18 px-4 py-6 text-center text-sm font-semibold text-sand/48">
              Generate your first track to remix it later.
            </div>
          ) : (
            generatedTracks.map((track) => {
              const isSelected = selectedWorkspaceTrackId === track.id
              const playId = `workspace-row-${track.id}`
              const isPlaying = playingReferenceId === playId

              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-3 rounded-2xl border p-2 transition ${
                    isSelected
                      ? "border-saffron/35 bg-saffron/[0.08]"
                      : "border-sand/8 bg-black/18 hover:border-saffron/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => togglePlaying(playId)}
                    disabled={isGenerating}
                    aria-label={`${isPlaying ? "Pause" : "Play"} ${track.title}`}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-sand/[0.08] text-sand/70 transition hover:bg-saffron hover:text-[#171717] disabled:opacity-40"
                  >
                    {isPlaying ? (
                      <Pause className="size-4 fill-current" aria-hidden="true" />
                    ) : (
                      <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspaceTrack(track.id)}
                    disabled={isGenerating}
                    aria-pressed={isSelected}
                    className="min-w-0 flex-1 rounded-xl px-1.5 py-1 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron disabled:opacity-45"
                  >
                    <span className="block truncate text-sm font-black text-sand">
                      {track.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs font-semibold text-sand/45">
                      {formatSongDate(track.createdAt)} | {track.duration}
                    </span>
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}

      {selectedReference && (
        <div className="mt-3 rounded-2xl border border-saffron/24 bg-saffron/[0.065] p-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => togglePlaying(selectedReference.id)}
              disabled={isGenerating}
              aria-label={`${playingReferenceId === selectedReference.id ? "Pause" : "Play"} ${selectedReference.title}`}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-saffron text-[#171717] transition hover:bg-[#f09a4f] disabled:opacity-45"
            >
              {playingReferenceId === selectedReference.id ? (
                <Pause className="size-4 fill-current" aria-hidden="true" />
              ) : (
                <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-saffron/24 bg-black/16 px-2 py-0.5 text-[var(--text-micro)] font-black uppercase tracking-[0.12em] text-saffron">
                  {selectedReference.sourceLabel}
                </span>
                <span className="text-xs font-bold text-sand/48">
                  {selectedReference.duration}
                </span>
              </div>
              <p className="mt-1 truncate text-sm font-black text-sand">
                {selectedReference.title}
              </p>
              <p className="mt-0.5 truncate text-xs font-semibold text-sand/45">
                {selectedReference.detail}
              </p>
            </div>

            {selectedReference.removable && (
              <button
                type="button"
                onClick={handleRemoveUpload}
                disabled={isGenerating}
                aria-label={`Remove ${selectedReference.title}`}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sand/55 transition hover:bg-sand/10 hover:text-sand disabled:opacity-40"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <TrackInputWaveform />
        </div>
      )}
    </div>
  )
}

function TrackInputWaveform() {
  return (
    <div className="mt-3 flex h-10 items-end gap-px" aria-hidden="true">
      {Array.from({ length: 40 }, (_, index) => (
        <span
          key={index}
          className={`w-full rounded-full ${
            index < 16 ? "bg-saffron/72" : "bg-sand/18"
          }`}
          style={{ height: `${7 + ((index * 11 + 5) % 27)}px` }}
        />
      ))}
    </div>
  )
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

// Task 4: Voice Style input. Upload / Record (MediaRecorder) / Library tabs.
// Self-contained UI; the captured audio lives in component state for V1 and can
// be wired into the generation request when the backend is ready.
function VoiceInput({
  isGenerating,
  onSampleAccepted,
  vocalGender,
  onVocalGenderChange,
}: {
  isGenerating: boolean
  onSampleAccepted?: () => void
  vocalGender: VocalGender
  onVocalGenderChange: (gender: VocalGender) => void
}) {
  const [activeTab, setActiveTab] = useState<VoiceInputTab>("upload")
  const [selectedUpload, setSelectedUpload] = useState<File | null>(null)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState("")
  const [recordState, setRecordState] = useState<"idle" | "recording" | "recorded">("idle")
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [recordError, setRecordError] = useState("")
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadUrlRef = useRef<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordSecondsRef = useRef(0)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  const source: "upload" | "record" | null = selectedUpload
    ? "upload"
    : recordState === "recorded"
      ? "record"
      : null
  const previewUrl = source === "upload" ? uploadUrl : recordedUrl
  const sourceLabel = source === "upload" ? "Uploaded voice" : "Recorded voice"
  const sourceDetail =
    source === "upload" && selectedUpload
      ? formatFileSize(selectedUpload.size)
      : `${formatClock(recordSeconds)} captured`
  const sourceTitle =
    source === "upload" && selectedUpload ? selectedUpload.name : "Voice take"

  // Revoke the recorded blob URL when it changes or the component unmounts.
  useEffect(() => {
    if (!recordedUrl) return
    return () => URL.revokeObjectURL(recordedUrl)
  }, [recordedUrl])

  // Stop any in-flight recording / mic stream / timer and revoke the upload URL
  // on unmount.
  useEffect(
    () => () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current)
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
      const recorder = mediaRecorderRef.current
      if (recorder && recorder.state !== "inactive") recorder.stop()
      if (uploadUrlRef.current) URL.revokeObjectURL(uploadUrlRef.current)
    },
    [],
  )

  function clearFileInput() {
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function clearUploadUrl() {
    if (uploadUrlRef.current) {
      URL.revokeObjectURL(uploadUrlRef.current)
      uploadUrlRef.current = null
    }
    setUploadUrl(null)
  }

  function stopRecording() {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== "inactive") recorder.stop()
    mediaRecorderRef.current = null
  }

  async function startRecording() {
    setRecordError("")

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setRecordError("Recording isn't supported in this browser.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        })
        setRecordedUrl(URL.createObjectURL(blob))
        setRecordState("recorded")
        setIsPreviewPlaying(false)
        onSampleAccepted?.()
        stream.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
      }

      mediaRecorderRef.current = recorder
      setSelectedUpload(null)
      clearUploadUrl()
      clearFileInput()
      recorder.start()
      setRecordState("recording")
      recordSecondsRef.current = 0
      setRecordSeconds(0)
      recordTimerRef.current = setInterval(() => {
        recordSecondsRef.current += 1
        setRecordSeconds(recordSecondsRef.current)
        if (recordSecondsRef.current >= VOICE_INPUT_MAX_RECORD_SECONDS) {
          stopRecording()
        }
      }, 1000)
    } catch {
      setRecordError("Microphone access was blocked. Allow mic permissions to record.")
    }
  }

  function handleUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const extension = file.name.split(".").pop()?.toLowerCase() ?? ""

    if (!VOICE_INPUT_ALLOWED_EXTENSIONS.has(extension)) {
      setFileError("Use an MP3, WAV, M4A, or OGG file.")
      setSelectedUpload(null)
      clearUploadUrl()
      clearFileInput()
      return
    }
    if (file.size > VOICE_INPUT_MAX_SIZE_BYTES) {
      setFileError(
        `Choose a file under ${VOICE_INPUT_MAX_SIZE_LABEL}. This file is ${formatFileSize(file.size)}.`,
      )
      setSelectedUpload(null)
      clearUploadUrl()
      clearFileInput()
      return
    }

    clearUploadUrl()
    const url = URL.createObjectURL(file)
    uploadUrlRef.current = url
    setUploadUrl(url)
    setFileError("")
    setSelectedUpload(file)
    setRecordState("idle")
    setRecordedUrl(null)
    setIsPreviewPlaying(false)
    onSampleAccepted?.()
  }

  function handleChangeVoice() {
    setSelectedUpload(null)
    clearUploadUrl()
    setRecordState("idle")
    setRecordedUrl(null)
    recordSecondsRef.current = 0
    setRecordSeconds(0)
    setFileError("")
    setIsPreviewPlaying(false)
    clearFileInput()
  }

  function togglePreview() {
    const audio = previewAudioRef.current
    if (!audio) return
    if (audio.paused) {
      void audio.play().catch(() => setIsPreviewPlaying(false))
      setIsPreviewPlaying(true)
    } else {
      audio.pause()
      setIsPreviewPlaying(false)
    }
  }

  const isRecording = recordState === "recording"
  const tooShort = recordSeconds > 0 && recordSeconds < VOICE_INPUT_MIN_RECORD_SECONDS

  return (
    <div className="mt-4 rounded-[1.35rem] border border-sand/8 bg-sand/[0.045] p-3 sm:mt-5 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Mic2 className="size-4 shrink-0 text-saffron" aria-hidden="true" />
          <span className="text-sm font-black text-sand/82">Voice style</span>
        </div>
        <span className="ml-auto text-[var(--text-micro)] font-black uppercase tracking-[0.12em] text-sand/42">
          Max {VOICE_INPUT_MAX_SIZE_LABEL} | {VOICE_INPUT_MIN_RECORD_SECONDS}–{VOICE_INPUT_MAX_DURATION_LABEL}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 rounded-full border border-sand/8 bg-black/18 p-1">
        {(["upload", "record", "library"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            className={`h-9 rounded-full text-sm font-black capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron ${
              activeTab === tab
                ? "bg-sand/12 text-sand"
                : "text-sand/50 hover:text-sand/75"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "upload" && (
        <div className="mt-3">
          <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-sand/14 bg-black/18 px-4 py-5 text-center transition hover:border-saffron/35 hover:bg-saffron/[0.045]">
            <input
              ref={fileInputRef}
              type="file"
              accept={VOICE_INPUT_ACCEPT}
              disabled={isGenerating}
              className="sr-only"
              onChange={handleUploadChange}
            />
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-saffron/12 text-saffron">
              <Upload className="size-5" aria-hidden="true" />
            </span>
            <span className="mt-3 text-sm font-black text-sand">Upload voice sample</span>
            <span className="mt-1 text-xs font-semibold text-sand/45">
              MP3, WAV, M4A, or OGG · up to 60s
            </span>
          </label>
          {fileError && (
            <p role="alert" className="mt-2 rounded-lg border border-saffron/25 bg-saffron/10 px-3 py-1.5 text-xs font-semibold text-saffron">
              {fileError}
            </p>
          )}
        </div>
      )}

      {activeTab === "record" && (
        <div className="mt-3 rounded-2xl border border-sand/8 bg-black/18 px-4 py-5 text-center">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isGenerating}
            aria-pressed={isRecording}
            className={`inline-flex size-14 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron disabled:opacity-40 ${
              isRecording
                ? "bg-saffron text-[#171717] shadow-[0_0_0_6px_rgba(227,122,44,0.18)] animate-pulse"
                : "bg-saffron/12 text-saffron hover:bg-saffron hover:text-[#171717]"
            }`}
          >
            {isRecording ? (
              <Square className="size-5 fill-current" aria-hidden="true" />
            ) : (
              <Mic2 className="size-6" aria-hidden="true" />
            )}
          </button>
          <p className="mt-3 text-sm font-black text-sand">
            {isRecording ? "Recording… tap to stop" : "Click to start recording"}
          </p>
          <p className="mt-1 text-xs font-bold tabular-nums text-sand/55">
            {formatClock(recordSeconds)} / {formatClock(VOICE_INPUT_MAX_RECORD_SECONDS)}
          </p>
          {isRecording && (
            <div className="mt-3 flex h-8 items-end justify-center gap-1" aria-hidden="true">
              {Array.from({ length: 22 }, (_, index) => (
                <span
                  key={index}
                  className="w-1 rounded-full bg-saffron/70 animate-pulse"
                  style={{
                    height: `${8 + ((index * 7 + recordSeconds * 5) % 24)}px`,
                    animationDelay: `${index * 60}ms`,
                  }}
                />
              ))}
            </div>
          )}
          {tooShort && recordState === "recorded" && (
            <p className="mt-2 text-xs font-semibold text-saffron">
              Aim for at least {VOICE_INPUT_MIN_RECORD_SECONDS}s for a usable voice sample.
            </p>
          )}
          {recordError && (
            <p role="alert" className="mt-2 rounded-lg border border-saffron/25 bg-saffron/10 px-3 py-1.5 text-xs font-semibold text-saffron">
              {recordError}
            </p>
          )}
        </div>
      )}

      {activeTab === "library" && (
        <div className="mt-3 rounded-2xl border border-sand/8 bg-black/18 px-4 py-8 text-center">
          <Mic2 className="mx-auto size-8 text-saffron/45" aria-hidden="true" />
          <p className="mt-3 text-sm font-black text-sand/72">No voices saved yet</p>
          <p className="mt-1 text-xs font-semibold text-sand/45">
            Saved voice personas will appear here.
          </p>
        </div>
      )}

      {source && previewUrl && (
        <div className="mt-3 rounded-2xl border border-saffron/24 bg-saffron/[0.065] p-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePreview}
              disabled={isGenerating}
              aria-label={`${isPreviewPlaying ? "Pause" : "Play"} ${sourceTitle}`}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-saffron text-[#171717] transition hover:bg-[#f09a4f] disabled:opacity-45"
            >
              {isPreviewPlaying ? (
                <Pause className="size-4 fill-current" aria-hidden="true" />
              ) : (
                <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-saffron/24 bg-black/16 px-2 py-0.5 text-[var(--text-micro)] font-black uppercase tracking-[0.12em] text-saffron">
                  {sourceLabel}
                </span>
                <span className="text-xs font-bold text-sand/48">{sourceDetail}</span>
              </div>
              <p className="mt-1 truncate text-sm font-black text-sand">{sourceTitle}</p>
              <p className="mt-0.5 text-xs font-semibold text-emerald-300/80">
                Voice style applied
              </p>
            </div>

            <button
              type="button"
              onClick={handleChangeVoice}
              disabled={isGenerating}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-sand/[0.08] px-3 text-xs font-black text-sand/70 transition hover:bg-sand/[0.14] hover:text-sand disabled:opacity-40"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Change
            </button>
          </div>
          <TrackInputWaveform />

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-saffron/15 pt-3">
            <span className="text-xs font-black text-sand/72">Voice type</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-sand/35">
              auto-detect preview · override
            </span>
            <div className="ml-auto inline-flex rounded-full bg-black/24 p-1">
              {(["male", "female"] as const).map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => onVocalGenderChange(gender)}
                  disabled={isGenerating}
                  aria-pressed={vocalGender === gender}
                  className={`rounded-full px-3 py-1 text-xs font-black capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron disabled:opacity-40 ${
                    vocalGender === gender
                      ? "bg-saffron text-[#171717]"
                      : "text-sand/55 hover:text-sand"
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          <audio
            ref={previewAudioRef}
            src={previewUrl}
            onEnded={() => setIsPreviewPlaying(false)}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}

function SongDescriptionPanel({
  actions,
  id,
  importedPrompt,
  isGenerating,
  isWarning,
  label = "Song Description",
  onChange,
  onRandom,
  onSuggestionClick,
  placeholder,
  suggestionTags,
  textDir = "ltr",
  value,
}: {
  actions?: ReactNode
  id: string
  importedPrompt: boolean
  isGenerating: boolean
  isWarning: boolean
  label?: string
  onChange: (value: string) => void
  onRandom: () => void
  onSuggestionClick: (suggestion: string) => void
  placeholder: string
  suggestionTags: readonly string[]
  textDir?: "ltr" | "rtl"
  value: string
}) {
  return (
    <div className="mt-4 rounded-[1.35rem] border border-sand/8 bg-sand/[0.045] p-3 sm:mt-5 sm:p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <label htmlFor={id} className="text-sm font-black text-sand/82">
              {label}
            </label>
            {importedPrompt && (
              <span className="text-[var(--text-micro)] font-bold uppercase tracking-wide text-saffron/70">
                Prompt imported
              </span>
            )}
          </div>
          <textarea
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={isGenerating}
            rows={3}
            maxLength={SONG_DESCRIPTION_MAX_LENGTH}
            aria-describedby={`${id}-counter`}
            dir={textDir}
            placeholder={placeholder}
            className={`mt-3 min-h-16 w-full resize-none bg-transparent text-base font-semibold leading-6 text-sand outline-none placeholder:text-sand/40 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-20 ${
              textDir === "rtl" ? "text-right" : ""
            }`}
          />
          <p
            id={`${id}-counter`}
            className={`mt-1 text-right text-xs font-black tabular-nums ${
              value.length >= SONG_DESCRIPTION_MAX_LENGTH
                ? "text-[#ff9585]"
                : isWarning
                  ? "text-saffron"
                  : "text-sand/42"
            }`}
          >
            {value.length} / {SONG_DESCRIPTION_MAX_LENGTH}
          </p>
        </div>
        <button
          type="button"
          onClick={onRandom}
          disabled={isGenerating}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-sand/[0.08] text-sand/70 transition hover:bg-saffron hover:text-[#171717] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
          aria-label="Surprise me"
          title="Surprise me"
        >
          <Dices className="size-5" aria-hidden="true" />
        </button>
      </div>

      {actions}

      {suggestionTags.length > 0 && (
        <SuggestionTags
          tags={suggestionTags}
          isGenerating={isGenerating}
          onClick={onSuggestionClick}
        />
      )}
    </div>
  )
}

function SuggestionTags({
  isGenerating,
  onClick,
  tags,
}: {
  isGenerating: boolean
  onClick: (suggestion: string) => void
  tags: readonly string[]
}) {
  return (
    <div className="mt-3">
      <p className="text-sm font-black text-sand/45">Suggestions</p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible">
        {tags.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onClick(suggestion)}
            disabled={isGenerating}
            className="shrink-0 rounded-full bg-sand/[0.08] px-4 py-2 text-sm font-black text-sand/82 transition hover:bg-saffron hover:text-[#171717] disabled:opacity-40"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

function GenerationSettingsPanel({
  bpm,
  duration,
  embedded = false,
  isGenerating,
  musicKey,
  onBpmChange,
  onDurationChange,
  onKeyChange,
  onVariationChange,
  totalCreditCost,
  variationCount,
}: {
  bpm: number
  duration: DurationOption
  embedded?: boolean
  isGenerating: boolean
  musicKey: MusicKey
  onBpmChange: (value: number) => void
  onDurationChange: (value: DurationOption) => void
  onKeyChange: (value: MusicKey) => void
  onVariationChange: (value: VariationCount) => void
  totalCreditCost: number
  variationCount: VariationCount
}) {
  const [isTuningOpen, setIsTuningOpen] = useState(false)
  const tapTimesRef = useRef<number[]>([])

  // Task 3b: tap-tempo — average the gaps between recent taps to derive BPM.
  function handleTapTempo() {
    if (isGenerating) return
    const now = performance.now()
    const times = tapTimesRef.current
    if (times.length > 0 && now - times[times.length - 1] > 2000) {
      times.length = 0
    }
    times.push(now)
    if (times.length > 5) times.shift()
    if (times.length >= 2) {
      let total = 0
      for (let index = 1; index < times.length; index += 1) {
        total += times[index] - times[index - 1]
      }
      const average = total / (times.length - 1)
      if (average > 0) {
        onBpmChange(Math.min(200, Math.max(60, Math.round(60000 / average))))
      }
    }
  }

  return (
    <div className={embedded ? "grid gap-3" : "mt-3 rounded-[1.25rem] border border-sand/8 bg-sand/[0.045] p-3 sm:mt-4 sm:rounded-[1.35rem] sm:p-4"}>
      {!embedded && (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-black text-sand">Generation</span>
        <span className="ml-auto rounded-full border border-saffron/20 bg-saffron/8 px-2.5 py-1 text-xs font-black text-saffron">
          {totalCreditCost} credits
        </span>
      </div>
      )}

      <div className={embedded ? "grid gap-3" : "mt-4 grid gap-3"}>
        <OptionPillGroup
          label="Duration"
          options={DURATION_OPTIONS.map((option) => ({
            label: option.label,
            meta: `${option.credits}`,
            value: option.value,
          }))}
          value={duration}
          disabled={isGenerating}
          onChange={onDurationChange}
        />

        <OptionPillGroup
          label="Variations"
          options={VARIATION_OPTIONS.map((option) => ({
            label: `${option}`,
            value: option,
          }))}
          value={variationCount}
          disabled={isGenerating}
          onChange={onVariationChange}
        />
      </div>

      <details
        className="mt-3 rounded-2xl bg-black/18 p-3 open:border open:border-sand/8"
        open={isTuningOpen}
        onToggle={(event) => setIsTuningOpen(event.currentTarget.open)}
      >
        <summary className="cursor-pointer list-none text-xs font-black uppercase tracking-[0.16em] text-sand/48 marker:hidden">
          BPM / Key
        </summary>

        <div className="mt-3 grid gap-3">
          <div className="rounded-xl bg-black/30 p-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-sand">BPM</span>
              <button
                type="button"
                onClick={handleTapTempo}
                disabled={isGenerating}
                aria-label="Tap tempo"
                className="rounded-full bg-sand/[0.08] px-2.5 py-1 text-[11px] font-black text-sand/70 transition hover:bg-saffron hover:text-[#171717] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
              >
                Tap
              </button>
              <span className="ml-auto text-xs font-black tabular-nums text-saffron">
                {bpm}
              </span>
            </div>
            <input
              type="range"
              min={60}
              max={200}
              value={bpm}
              disabled={isGenerating}
              onChange={(event) => onBpmChange(Number(event.target.value))}
              className="mt-3 h-6 w-full cursor-pointer appearance-none bg-transparent accent-[#e37a2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="BPM"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {BPM_QUICK_PICKS.map((pick) => (
                <button
                  key={pick.label}
                  type="button"
                  onClick={() => onBpmChange(pick.value)}
                  disabled={isGenerating}
                  aria-pressed={bpm === pick.value}
                  className={`rounded-full px-2.5 py-1 text-xs font-black transition disabled:opacity-40 ${
                    bpm === pick.value
                      ? "bg-saffron text-[#171717]"
                      : "bg-sand/[0.08] text-sand/58 hover:text-sand"
                  }`}
                >
                  {pick.label} {pick.value}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-black/30 p-3">
            <span className="text-xs font-black text-sand">Key</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {KEY_OPTIONS.map((keyOption) => (
                <button
                  key={keyOption}
                  type="button"
                  onClick={() => onKeyChange(keyOption)}
                  disabled={isGenerating}
                  aria-pressed={musicKey === keyOption}
                  className={`rounded-full px-2.5 py-1.5 text-xs font-black transition disabled:opacity-40 ${
                    musicKey === keyOption
                      ? "bg-saffron text-[#171717]"
                      : "bg-sand/[0.08] text-sand/62 hover:text-sand"
                  }`}
                >
                  {keyOption}
                </button>
              ))}
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}

function OptionPillGroup<T extends string | number>({
  disabled,
  label,
  onChange,
  options,
  value,
}: {
  disabled: boolean
  label: string
  onChange: (value: T) => void
  options: { label: string; meta?: string; value: T }[]
  value: T
}) {
  return (
    <div className="rounded-xl bg-black/18 p-2">
      <div className="mb-2 px-1 text-xs font-black text-sand/58">{label}</div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {options.map((option) => (
          <button
            key={`${option.value}`}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            aria-pressed={value === option.value}
            className={`min-h-10 rounded-full border px-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${
              value === option.value
                ? "border-saffron bg-saffron text-[#171717]"
                : "border-sand/10 bg-sand/[0.07] text-sand/72 hover:border-saffron/28 hover:text-sand"
            }`}
          >
            {option.label}
            {option.meta && (
              <span className="ml-1 text-[var(--text-micro)] opacity-70">
                {option.meta}cr
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function GenerationJobCard({
  elapsedSeconds,
  onCancel,
  pendingGeneration,
}: {
  elapsedSeconds: number
  onCancel: () => void
  pendingGeneration: PendingGeneration
}) {
  const promptSnippet =
    pendingGeneration.prompt.length > 120
      ? `${pendingGeneration.prompt.slice(0, 120).trim()}...`
      : pendingGeneration.prompt

  return (
    <div className="mt-5 rounded-2xl border border-saffron/18 bg-saffron/[0.06] p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-saffron/12 text-saffron">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-saffron">
              Generating your track...
            </p>
            <span className="rounded-full border border-sand/10 bg-black/18 px-2 py-0.5 text-[var(--text-micro)] font-black uppercase tracking-[0.12em] text-sand/52">
              {pendingGeneration.modeLabel}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-sand/52">
            Elapsed {formatElapsedTime(elapsedSeconds)}
          </p>
          <p className="mt-3 line-clamp-2 text-sm font-semibold leading-5 text-sand/70">
            {promptSnippet || "Soroz folk with Damboora and Suroz"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[var(--text-micro)] font-black uppercase tracking-[0.12em] text-sand/42">
            <span>{pendingGeneration.duration}</span>
            <span>{pendingGeneration.variationCount} variations</span>
            <span>{pendingGeneration.creditsUsed} credits</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-sand/10 bg-black/18 px-3 py-1.5 text-xs font-black text-sand/70 transition hover:border-saffron/30 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
        >
          Cancel
        </button>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-sand/10">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-saffron" />
      </div>
    </div>
  )
}

interface GenerationProgressProps {
  status: StudioStatus
  progress: number
  isGenerating: boolean
  stageIndex: number
  etaSeconds?: number
  queuePosition?: number
}

function GenerationProgress({
  status,
  progress,
  isGenerating,
  stageIndex,
  etaSeconds,
  queuePosition,
}: GenerationProgressProps) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    etaSeconds ?? null
  )

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    const timeout = window.setTimeout(() => {
      if (etaSeconds == null) {
        setSecondsLeft(null)
        return
      }

      setSecondsLeft(etaSeconds)
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev == null || prev <= 1) {
            if (interval) {
              clearInterval(interval)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, 0)

    return () => {
      window.clearTimeout(timeout)
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [etaSeconds])

  if (!isGenerating && status !== "done") return null

  return (
    <div className="rounded-2xl border border-sand/8 bg-black/18 p-3">
      <div className="flex items-center gap-2">
        {isGenerating ? (
          <Loader2 className="size-4 animate-spin text-saffron" aria-hidden="true" />
        ) : (
          <Sparkles className="size-4 text-saffron" aria-hidden="true" />
        )}
        <span className="text-sm font-black text-sand">{STATUS_LABELS[status]}</span>
        <span className="ml-auto text-xs font-black tabular-nums text-sand/45">
          {progress}%
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand/10">
        <div
          className="h-full rounded-full bg-saffron transition-all duration-300"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Generation progress"
          style={{ width: `${progress}%` }}
        />
      </div>
      {(secondsLeft != null || queuePosition != null) && (
        <p className="mt-2 text-sm text-sand/60">
          {queuePosition != null && secondsLeft == null
            ? `Position ${queuePosition} in queue`
            : secondsLeft === 0
              ? "Almost done..."
              : secondsLeft != null
                ? `~${secondsLeft}s remaining`
                : null}
        </p>
      )}
      {isGenerating && (
        <div className="mt-2 flex gap-1.5">
          {GENERATION_STAGES.map((stage, index) => (
            <span
              key={stage}
              className={`rounded-full border px-2 py-0.5 text-[var(--text-micro)] font-black uppercase tracking-[0.12em] ${
                stage === status
                  ? "border-saffron/35 bg-saffron/10 text-saffron"
                  : index < stageIndex
                    ? "border-sand/12 bg-sand/8 text-sand/38"
                    : "border-sand/8 text-sand/25"
              }`}
            >
              {stage}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
