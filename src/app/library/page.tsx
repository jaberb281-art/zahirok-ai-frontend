"use client"

import { useEffect, useMemo, useState } from "react"

import {
    MOCK_SAVED_ITEMS,
    MOCK_STUDIO_ITEMS,
    StudioEmptyState,
    StudioHeader,
    StudioItemList,
    StudioStatsBar,
    StudioTabBar,
    StudioToolbar,
    filterItemsForStudio,
    type StudioItem,
    type StudioTab,
} from "@/components/library/studio-workspace"
import { getDemoImage } from "@/lib/demo-images"
import {
    archiveSong,
    fetchLibrary,
    isPersistedSongId,
    renameSongOnServer,
} from "@/lib/library-client"
import type { Song } from "@/lib/types"
import { useLibraryHydrated, useLibraryStore } from "@/stores/library-store"

const STORE_ITEM_GRADIENT = "linear-gradient(135deg, #1a0a0a 0%, #3a2010 100%)"

function hashId(id: string): number {
    let hash = 0
    for (let i = 0; i < id.length; i += 1) {
        hash = (hash * 31 + id.charCodeAt(i)) % 100000
    }
    return hash
}

// Generated tracks store duration as "M:SS" or as a create-page preset
// ("30s"/"1min"/"2min"/"4min"); normalize to seconds for the card badge.
function durationToSeconds(value: string): number {
    if (/^\d+:\d{2}$/.test(value)) {
        const [minutes, seconds] = value.split(":").map(Number)
        return minutes * 60 + seconds
    }
    if (value.endsWith("min")) return (parseInt(value, 10) || 0) * 60
    if (value.endsWith("s")) return parseInt(value, 10) || 0
    return 0
}

// Map a player Song from the library store onto the existing studio card's
// props, so playback (audioUrl) routes through the real Howler engine.
function songToStudioItem(song: Song): StudioItem {
    return {
        id: song.id,
        title: song.title,
        status: "generated",
        prompt: song.prompt,
        tags: ["Makkuran", song.genrePreset],
        instrumentTags: song.instruments,
        duration: durationToSeconds(song.duration),
        createdAt: song.createdAt,
        audioUrl: song.mp3Url,
        imageUrl: getDemoImage(hashId(song.id)),
        gradientFallback: STORE_ITEM_GRADIENT,
        isPublic: song.isPublic,
    }
}

export default function LibraryPage() {
    const [activeTab, setActiveTab] = useState<StudioTab>("all")
    const [query, setQuery] = useState("")
    const [savedItems] = useState<StudioItem[]>(MOCK_SAVED_ITEMS)
    const [notice, setNotice] = useState<string | null>(null)
    const [mockItems, setMockItems] = useState<StudioItem[]>(MOCK_STUDIO_ITEMS)
    const [libraryReady, setLibraryReady] = useState(false)

    const hydrated = useLibraryHydrated()
    const storeSongs = useLibraryStore((state) => state.songs)
    const setSongsFromServer = useLibraryStore((state) => state.setSongsFromServer)
    const removeSong = useLibraryStore((state) => state.removeSong)
    const renameSong = useLibraryStore((state) => state.renameSong)

    useEffect(() => {
        let cancelled = false

        async function loadLibrary() {
            try {
                const songs = await fetchLibrary()
                if (!cancelled) {
                    setSongsFromServer(songs)
                }
            } catch {
                // Keep any cached client songs if the server library is unavailable.
            } finally {
                if (!cancelled) {
                    setLibraryReady(true)
                }
            }
        }

        void loadLibrary()

        return () => {
            cancelled = true
        }
    }, [setSongsFromServer])

    const usingStore = hydrated && libraryReady
    const studioItems = useMemo(
        () => (usingStore ? storeSongs.map(songToStudioItem) : mockItems),
        [usingStore, storeSongs, mockItems],
    )

    const visibleItems = useMemo(
        () => filterItemsForStudio(activeTab, query, studioItems, savedItems),
        [activeTab, query, savedItems, studioItems],
    )

    function handleTabChange(tab: StudioTab) {
        setActiveTab(tab)
        setQuery("")
    }

    function handleDelete(id: string) {
        if (usingStore) {
            if (isPersistedSongId(id)) {
                void archiveSong(id).catch(() => {
                    setNotice("Failed to delete song.")
                    window.setTimeout(() => setNotice(null), 2600)
                })
            }
            removeSong(id)
            return
        }

        setMockItems((items) => items.filter((item) => item.id !== id))
    }

    function handleRename(id: string, title: string) {
        if (usingStore) {
            if (isPersistedSongId(id)) {
                void renameSongOnServer(id, title).catch(() => {
                    setNotice("Failed to rename song.")
                    window.setTimeout(() => setNotice(null), 2600)
                })
            }
            renameSong(id, title)
            return
        }

        setMockItems((items) =>
            items.map((item) => (item.id === id ? { ...item, title } : item)),
        )
    }

    function handleTogglePublic(id: string) {
        if (!usingStore) {
            setMockItems((items) =>
                items.map((item) =>
                    item.id === id ? { ...item, isPublic: !item.isPublic } : item,
                ),
            )
        }
        setNotice("Visibility updated.")
        window.setTimeout(() => setNotice(null), 2600)
    }

    function handleNotice(message: string) {
        setNotice(message)
        window.setTimeout(() => setNotice(null), 2600)
    }

    return (
        <div className="min-h-dvh w-full max-w-full min-w-0 overflow-x-hidden bg-[#101010] text-sand">
            <main className="min-h-dvh w-full max-w-full min-w-0 px-4 pb-6 pt-6 md:px-6 lg:pb-8 xl:px-8">
                <StudioHeader />

                {notice ? (
                    <p
                        role="status"
                        className="mt-4 inline-flex max-w-full rounded-full border border-saffron/25 bg-saffron/10 px-3 py-1.5 text-xs font-bold text-saffron"
                    >
                        {notice}
                    </p>
                ) : null}

                <StudioTabBar activeTab={activeTab} onTabChange={handleTabChange} />
                <StudioStatsBar items={studioItems} />
                <StudioToolbar query={query} setQuery={setQuery} />

                <section
                    id={`studio-panel-${activeTab}`}
                    role="tabpanel"
                    aria-labelledby={`studio-tab-${activeTab}`}
                >
                    {visibleItems.length === 0 ? (
                        <div className="mt-5">
                            <StudioEmptyState tab={activeTab} />
                        </div>
                    ) : (
                        <StudioItemList
                            items={visibleItems}
                            onDelete={handleDelete}
                            onNotice={handleNotice}
                            onRename={handleRename}
                            onTogglePublic={handleTogglePublic}
                        />
                    )}
                </section>
            </main>
        </div>
    )
}
