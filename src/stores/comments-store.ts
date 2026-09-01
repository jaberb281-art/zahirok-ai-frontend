import { useEffect, useState } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { SongComment } from "@/lib/api-contracts"

type CommentsState = {
    commentsBySong: Record<string, SongComment[]>
    addComment: (songId: string, body: string, authorName?: string) => void
}

export const useCommentsStore = create<CommentsState>()(
    persist(
        (set) => ({
            commentsBySong: {},

            addComment: (songId, body, authorName = "You") =>
                set((state) => {
                    const comment: SongComment = {
                        id: `comment-${songId}-${Date.now()}-${Math.random()
                            .toString(36)
                            .slice(2, 7)}`,
                        songId,
                        authorName,
                        body,
                        createdAt: new Date().toISOString(),
                    }
                    const existing = state.commentsBySong[songId] ?? []
                    return {
                        commentsBySong: {
                            ...state.commentsBySong,
                            [songId]: [...existing, comment],
                        },
                    }
                }),
        }),
        { name: "zahirok:comments:v1" },
    ),
)

/**
 * Mirrors useLibraryHydrated: a client-only mount flag that gates rendering of
 * persisted comments so the server render and the first client render match
 * (no App Router hydration mismatch).
 */
export function useCommentsHydrated(): boolean {
    const [hydrated, setHydrated] = useState(false)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client-only mount flag for SSR gating
        setHydrated(true)
    }, [])
    return hydrated
}
