"use client"

import { Suspense } from "react"
import { usePathname } from "next/navigation"

import { BottomPlayer } from "@/components/layout/bottom-player"
import { MobileAppNavbar } from "@/components/layout/mobile-app-navbar"
import { MobileTabBar } from "@/components/layout/mobile-tab-bar"
import { StudioRail } from "@/components/layout/studio-rail"
import { usePlayerStore } from "@/stores/player-store"

/** Routes where global music playback BottomPlayer should appear */
const PLAYER_ROUTES = [
    "/dashboard",
    "/create",
    "/library",
    "/feed",
    "/radio",
    "/song/",
    "/notifications",
    "/labs",
    "/studio",
]

function shouldShowBottomPlayer(pathname: string): boolean {
    return PLAYER_ROUTES.some((route) =>
        route.endsWith("/") ? pathname.startsWith(route) : pathname === route,
    )
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const currentSong = usePlayerStore((state) => state.currentSong)
    const isPublicRoute = pathname === "/" || pathname.startsWith("/auth/")

    if (isPublicRoute) {
        return <>{children}</>
    }

    const showPlayerRoute = shouldShowBottomPlayer(pathname)
    const bottomPlayerActive = showPlayerRoute && currentSong != null
    const showMobileAppNavbar = true
    const showMobileTabBar = true

    return (
        <div
            className="flex min-h-dvh overflow-x-hidden bg-charcoal"
            data-has-bottom-player={showPlayerRoute ? "true" : "false"}
            data-bottom-player-active={bottomPlayerActive ? "true" : "false"}
            data-has-mobile-tab-bar={showMobileTabBar ? "true" : "false"}
        >
            {/* Desktop studio rail */}
            <Suspense fallback={<StudioRailFallback />}>
                <StudioRail />
            </Suspense>

            {/* Shared mobile top navbar */}
            {showMobileAppNavbar && <MobileAppNavbar />}

            {/* Main scrollable area; the shell owns fixed-nav safe-area spacing. */}
            <main className={`main-content flex min-h-dvh w-full min-w-0 flex-col pb-[var(--app-bottom-safe-area)] transition-[margin-left,padding-bottom] duration-200 lg:ms-[var(--app-sidebar-width,248px)] lg:w-auto lg:flex-1 lg:pb-[var(--app-desktop-bottom-safe-area)] lg:pt-0 ${showMobileAppNavbar ? "pt-14" : "pt-0"}`}>
                <div className="min-h-0 flex-1">
                    {children}
                </div>
            </main>

            {/* Persistent bottom player — only on music-playback routes */}
            {showPlayerRoute && <BottomPlayer />}

            {/* Mobile tab bar */}
            {showMobileTabBar && <MobileTabBar />}
        </div>
    )
}

function StudioRailFallback() {
    return (
        <div
            aria-hidden={true}
            className="app-sidebar fixed inset-y-0 left-0 z-[90] hidden h-screen w-[248px] border-e border-white/[0.1] bg-[#11100f] lg:flex"
        />
    )
}
