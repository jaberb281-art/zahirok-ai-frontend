import { create } from "zustand"
import { Howl } from "howler"

import type { Song } from "@/lib/types"

type PlayerState = {
    currentSong: Song | null
    isPlaying: boolean
    progress: number // 0–100
    duration: number // seconds (real, reported by the audio engine)
    volume: number // 0–1
    isLooping: boolean
    queue: Song[]
    queueIndex: number
}

type PlayerActions = {
    play: (song: Song, queue?: Song[]) => void
    pause: () => void
    resume: () => void
    toggle: () => void
    stop: () => void
    setProgress: (progress: number) => void
    setVolume: (volume: number) => void
    toggleLoop: () => void
    playNext: () => void
    playPrev: () => void
}

// The single audio engine. The Howl instance and the tick timer live outside
// the store so they never become reactive state; only one track is ever loaded.
let howl: Howl | null = null
let tickTimer: ReturnType<typeof setInterval> | null = null

function getAudioUrl(song: Song): string {
    return song.mp3Url || song.audioUrl
}

export const usePlayerStore = create<PlayerState & PlayerActions>((set, get) => {
    function stopTick() {
        if (tickTimer !== null) {
            clearInterval(tickTimer)
            tickTimer = null
        }
    }

    // Read the real playback position/duration from the engine into the store.
    function syncProgress() {
        if (!howl) return
        const duration = howl.duration() || 0
        const seconds = (howl.seek() as number) || 0
        const progress = duration > 0 ? Math.min(100, (seconds / duration) * 100) : 0
        set({ progress, duration })
    }

    // A timer (rather than requestAnimationFrame) keeps the progress bar
    // updating even when the tab is backgrounded, where rAF is suspended.
    function startTick() {
        stopTick()
        syncProgress()
        tickTimer = setInterval(syncProgress, 250)
    }

    // Load a song into the engine and start playback. Replaces any prior Howl.
    function loadAndPlay(song: Song) {
        stopTick()
        if (howl) {
            howl.unload()
            howl = null
        }

        howl = new Howl({
            src: [getAudioUrl(song)],
            html5: true, // stream remote files instead of fully decoding them
            volume: get().volume,
            onload: () => set({ duration: howl?.duration() ?? 0 }),
            onplay: () => {
                set({ isPlaying: true })
                startTick()
            },
            onpause: () => {
                set({ isPlaying: false })
                stopTick()
            },
            onstop: () => stopTick(),
            onend: () => {
                stopTick()
                advanceOnEnd()
            },
            onloaderror: () => set({ isPlaying: false }),
            onplayerror: () => set({ isPlaying: false }),
        })

        howl.play()
    }

    // Called when a track finishes on its own: advance the queue, wrap to the
    // start when looping, otherwise halt at the end.
    function advanceOnEnd() {
        const { queue, queueIndex, isLooping } = get()
        const nextIndex = queueIndex + 1

        if (nextIndex < queue.length) {
            const next = queue[nextIndex]
            set({ currentSong: next, queueIndex: nextIndex, progress: 0, duration: 0 })
            loadAndPlay(next)
            return
        }

        if (isLooping && queue.length > 0) {
            const first = queue[0]
            set({ currentSong: first, queueIndex: 0, progress: 0, duration: 0 })
            loadAndPlay(first)
            return
        }

        set({ isPlaying: false, progress: 100 })
    }

    return {
        currentSong: null,
        isPlaying: false,
        progress: 0,
        duration: 0,
        volume: 0.8,
        isLooping: false,
        queue: [],
        queueIndex: 0,

        play(song, queue) {
            const resolvedQueue = queue ?? [song]
            const queueIndex = resolvedQueue.findIndex((item) => item.id === song.id)

            set({
                currentSong: song,
                isPlaying: true,
                progress: 0,
                duration: 0,
                queue: resolvedQueue,
                queueIndex: Math.max(0, queueIndex),
            })

            loadAndPlay(song)
        },

        pause() {
            howl?.pause()
            set({ isPlaying: false })
        },

        resume() {
            const { currentSong } = get()
            if (!currentSong) return
            if (howl) {
                howl.play()
            } else {
                loadAndPlay(currentSong)
            }
        },

        toggle() {
            const { isPlaying, currentSong } = get()

            if (!currentSong) return

            if (isPlaying) {
                howl?.pause()
            } else if (howl) {
                howl.play()
            } else {
                loadAndPlay(currentSong)
            }
        },

        stop() {
            stopTick()
            if (howl) {
                howl.unload()
                howl = null
            }
            set({
                currentSong: null,
                isPlaying: false,
                progress: 0,
                duration: 0,
                queue: [],
                queueIndex: 0,
            })
        },

        setProgress(progress) {
            const clamped = Math.max(0, Math.min(100, progress))
            const duration = howl?.duration() || get().duration || 0

            if (howl && duration > 0) {
                howl.seek((clamped / 100) * duration)
            }

            set({ progress: clamped })
        },

        setVolume(volume) {
            const clamped = Math.max(0, Math.min(1, volume))
            howl?.volume(clamped)
            set({ volume: clamped })
        },

        toggleLoop() {
            set((state) => ({ isLooping: !state.isLooping }))
        },

        playNext() {
            const { queue, queueIndex, isLooping } = get()

            if (queue.length === 0) return

            const nextIndex = queueIndex + 1

            if (nextIndex >= queue.length) {
                if (isLooping) {
                    const first = queue[0]
                    set({ currentSong: first, queueIndex: 0, progress: 0, duration: 0 })
                    loadAndPlay(first)
                }
                return
            }

            const next = queue[nextIndex]
            set({ currentSong: next, queueIndex: nextIndex, progress: 0, duration: 0 })
            loadAndPlay(next)
        },

        playPrev() {
            const { queue, queueIndex, progress } = get()

            if (queue.length === 0) return

            // If more than ~5% in, restart the current track instead of skipping.
            if (progress > 5) {
                howl?.seek(0)
                set({ progress: 0 })
                return
            }

            const prevIndex = queueIndex - 1

            if (prevIndex < 0) return

            const prev = queue[prevIndex]
            set({ currentSong: prev, queueIndex: prevIndex, progress: 0, duration: 0 })
            loadAndPlay(prev)
        },
    }
})
