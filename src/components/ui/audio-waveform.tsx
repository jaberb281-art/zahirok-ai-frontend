"use client"

import { useEffect, useRef } from "react"
import WaveSurfer from "wavesurfer.js"

import { usePlayerStore } from "@/stores/player-store"

interface AudioWaveformProps {
  audioUrl: string | null
  /** Accepted for backward compatibility; playback is owned by the engine. */
  isPlaying?: boolean
  height?: number
  onSeek?: (time: number) => void
  className?: string
}

export function AudioWaveform({
  audioUrl,
  height = 48,
  className = "",
}: AudioWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)

  // Render the waveform for peaks only. This instance is display-only and never
  // produces audio — playback is owned entirely by the Howler engine in the
  // player store, so this is not a second, competing audio source.
  useEffect(() => {
    if (!containerRef.current || !audioUrl) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      url: audioUrl,
      waveColor: "rgba(255, 255, 255, 0.15)",
      progressColor: "#e37a2c",
      height,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      interact: false, // display-only: no user seeking/playback from the waveform
    })

    ws.on("ready", () => {
      // Belt-and-suspenders: stay silent even if a media element is created.
      try {
        ws.setMuted(true)
      } catch {
        // API shape mismatch across versions — safe to ignore
      }
    })

    wavesurferRef.current = ws

    return () => {
      ws.destroy()
      wavesurferRef.current = null
    }
  }, [audioUrl, height])

  // Mirror the Howler engine's playback position onto the waveform cursor while
  // this visualizer represents the track that is currently playing.
  useEffect(() => {
    const unsubscribe = usePlayerStore.subscribe((state) => {
      const ws = wavesurferRef.current
      if (!ws || !audioUrl) return

      const current = state.currentSong
      const isCurrent =
        !!current &&
        (current.mp3Url === audioUrl || current.audioUrl === audioUrl)
      if (!isCurrent) return

      const fraction = Math.min(1, Math.max(0, state.progress / 100))
      try {
        ws.seekTo(fraction)
      } catch {
        // waveform may not be ready yet — the next update will catch up
      }
    })

    return unsubscribe
  }, [audioUrl])

  if (!audioUrl) {
    // Placeholder bars when no audio is loaded
    return (
      <div
        className={`flex items-center gap-[2px] ${className}`}
        style={{ height }}
        aria-hidden="true"
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="w-[2px] rounded-full bg-white/10"
            style={{
              height: `${20 + Math.sin(i * 0.8) * 14}px`,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ height }}
    />
  )
}
