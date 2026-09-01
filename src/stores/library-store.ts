import { useEffect, useState } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { Song } from "@/lib/types"

type LibraryState = {
    songs: Song[]
    addSongs: (songs: Song[]) => void
    setSongsFromServer: (songs: Song[]) => void
    removeSong: (id: string) => void
    renameSong: (id: string, title: string) => void
}

export const useLibraryStore = create<LibraryState>()(
    persist(
        (set) => ({
            songs: [],

            addSongs: (incoming) =>
                set((state) => {
                    // Dedupe by id so a StrictMode double-invoke of the create
                    // pipeline (or a re-add) can't create duplicates.
                    const existing = new Set(state.songs.map((song) => song.id))
                    const fresh = incoming.filter((song) => !existing.has(song.id))
                    // Prepend so the most recently generated tracks are newest-first.
                    return { songs: [...fresh, ...state.songs] }
                }),

            setSongsFromServer: (songs) => set({ songs }),

            removeSong: (id) =>
                set((state) => ({
                    songs: state.songs.filter((song) => song.id !== id),
                })),

            renameSong: (id, title) =>
                set((state) => ({
                    songs: state.songs.map((song) =>
                        song.id === id ? { ...song, title } : song,
                    ),
                })),
        }),
        { name: "zahirok:library:v1" },
    ),
)

/**
 * True only after the client has mounted. Used to gate rendering of persisted
 * tracks so the server render and the first client render are identical (both
 * `false` → both render the fallback), avoiding an App Router hydration
 * mismatch. The flag flips in a post-mount effect, after which zustand's
 * synchronous localStorage rehydration has already populated `songs`.
 *
 * useState + useEffect (rather than useSyncExternalStore) is deliberate: it
 * guarantees `false` during the hydration render regardless of Suspense/loading
 * boundaries, where a client snapshot could otherwise resolve early and cause a
 * mismatch that bails hydration entirely.
 */
export function useLibraryHydrated(): boolean {
    const [hydrated, setHydrated] = useState(false)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client-only mount flag for SSR gating
        setHydrated(true)
    }, [])
    return hydrated
}
