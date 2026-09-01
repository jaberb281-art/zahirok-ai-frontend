"use client"

import { useState } from "react"
import {
  AudioWaveform,
  Clapperboard,
  Disc3,
  Globe,
  Guitar,
  Mic2,
  MoreHorizontal,
  Music2,
  Piano,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

import { useEarlyAccess } from "@/components/early-access/early-access-provider"
import { isLaunchModeEnabled } from "@/lib/launch-mode"

const PLACEHOLDER = "What kind of music do you want to create?"

const GENRE_TAGS: { label: string; icon: LucideIcon; prompt: string }[] = [
  { label: "Pop", icon: Music2, prompt: "upbeat pop with bright vocals" },
  { label: "Hip Hop", icon: Mic2, prompt: "hip hop with strong rhythm and spoken energy" },
  { label: "Lo-fi", icon: Disc3, prompt: "lo-fi chill beats with warm texture" },
  { label: "Rock", icon: Guitar, prompt: "rock with electric guitar drive" },
  { label: "Classical", icon: Piano, prompt: "classical orchestration with elegant melody" },
  { label: "EDM", icon: AudioWaveform, prompt: "EDM with pulsing synths and drops" },
  { label: "Folk", icon: Guitar, prompt: "folk with acoustic warmth and storytelling" },
  { label: "World", icon: Globe, prompt: "world music with global rhythms and instruments" },
  { label: "Cinematic", icon: Clapperboard, prompt: "cinematic score with emotional atmosphere" },
]

export function LandingPrompt() {
  const { openEarlyAccess } = useEarlyAccess()
  const [prompt, setPrompt] = useState("")
  const [note, setNote] = useState("")
  const [activeGenre, setActiveGenre] = useState<string | null>(null)
  const launchMode = isLaunchModeEnabled()

  function goCreate(nextPrompt?: string) {
    const trimmed = (nextPrompt ?? prompt).trim()
    if (!trimmed) {
      setNote("Describe a song idea first.")
      return
    }

    setNote("")
    if (launchMode) {
      openEarlyAccess()
      return
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    goCreate()
  }

  function handleGenre(tag: (typeof GENRE_TAGS)[number]) {
    setActiveGenre(tag.label)
    setPrompt(tag.prompt)
    setNote("")
  }

  return (
    <div className="mx-auto mt-9 w-full max-w-[820px] sm:mt-10">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className="rounded-full p-[1.5px] shadow-[0_0_40px_rgba(227,122,44,0.18),0_0_80px_rgba(180,80,160,0.12)]"
          style={{
            background:
              "linear-gradient(90deg, rgba(180,90,200,0.55), rgba(227,122,44,0.95) 70%)",
          }}
        >
          <div className="flex items-center gap-2 rounded-full bg-[#121214] py-1.5 pl-5 pr-1.5 sm:pl-6 sm:pr-2">
            <label className="sr-only" htmlFor="landing-song-prompt">
              Describe the music you want to create
            </label>
            <input
              id="landing-song-prompt"
              value={prompt}
              onChange={(event) => {
                setPrompt(event.target.value)
                setNote("")
                setActiveGenre(null)
              }}
              aria-label="Describe the music you want to create"
              className="min-w-0 flex-1 bg-transparent py-3 text-left text-sm font-semibold text-white outline-none placeholder:text-white/40 sm:text-base"
              placeholder={PLACEHOLDER}
            />
            <button
              type="submit"
              aria-label="Generate song"
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#f0a15a,#e37a2c)] px-4 text-sm font-black text-[#171210] shadow-[0_8px_24px_rgba(227,122,44,0.35)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron sm:h-12 sm:px-5"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Generate
            </button>
          </div>
        </div>
        {note ? (
          <p role="status" className="mt-3 text-center text-xs font-semibold text-saffron">
            {note}
          </p>
        ) : null}
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-7 sm:gap-2.5">
        {GENRE_TAGS.map((tag) => {
          const Icon = tag.icon
          const active = activeGenre === tag.label
          return (
            <button
              key={tag.label}
              type="button"
              onClick={() => handleGenre(tag)}
              aria-pressed={active}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron sm:h-10 sm:px-3.5 sm:text-sm ${
                active
                  ? "border-saffron/40 bg-saffron/15 text-white"
                  : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/18 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <Icon className="size-3.5 text-[#e37a8c]" aria-hidden="true" />
              {tag.label}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => {
            if (launchMode) {
              openEarlyAccess()
            }
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-white/70 transition hover:border-white/18 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron sm:h-10 sm:px-3.5 sm:text-sm"
        >
          <MoreHorizontal className="size-3.5 text-[#e37a8c]" aria-hidden="true" />
          More
        </button>
      </div>
    </div>
  )
}
