"use client"

import { useEffect, useMemo } from "react"
import type { ComponentType } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
    Compass,
    CreditCard,
    Home,
    Plus,
    Radio,
    SlidersHorizontal,
    Sparkles,
    UserRound,
    Wand2,
} from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { GatedLink } from "@/components/early-access/gated-link"

type RailItem = {
    href: string
    label: string
    icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
    activeWhen: (context: ActiveContext) => boolean
}

type ActiveContext = {
    pathname: string
    space: string | null
    view: string | null
}

const HOME_ITEM: RailItem = {
    href: "/dashboard",
    label: "Home",
    icon: Home,
    activeWhen: ({ pathname }) => pathname === "/dashboard",
}

const CREATE_ITEM: RailItem = {
    href: "/create",
    label: "Create",
    icon: Wand2,
    activeWhen: ({ pathname }) =>
        pathname === "/create" || pathname.startsWith("/create/"),
}

const DISCOVER_ITEMS: RailItem[] = [
    {
        href: "/feed",
        label: "Discover",
        icon: Compass,
        activeWhen: ({ pathname, view }) => pathname === "/feed" && !view,
    },
    {
        href: "/radio",
        label: "Radio",
        icon: Radio,
        activeWhen: ({ pathname }) => pathname === "/radio",
    },
] as const

const MY_SPACE_ITEMS: RailItem[] = [
    {
        href: "/library",
        label: "My Studio",
        icon: SlidersHorizontal,
        activeWhen: ({ pathname }) =>
            pathname === "/library" || pathname.startsWith("/song/"),
    },
] as const

const USER = {
    credits: 75,
    handle: "jaberb281",
    tier: "Free",
}

export function StudioRail() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const activeContext = useMemo<ActiveContext>(
        () => ({
            pathname,
            space: searchParams.get("space"),
            view: searchParams.get("view"),
        }),
        [pathname, searchParams],
    )

    const createSongActive =
        pathname === "/create" || pathname.startsWith("/create/")

    useEffect(() => {
        document.documentElement.style.setProperty("--app-sidebar-width", "248px")

        return () => {
            document.documentElement.style.removeProperty("--app-sidebar-width")
        }
    }, [])

    return (
        <aside className="app-sidebar fixed inset-y-0 left-0 z-[90] hidden h-screen w-[248px] border-e border-white/[0.1] bg-[#11100f] text-sand shadow-[18px_0_60px_rgba(0,0,0,0.18)] lg:flex">
            <div className="flex h-full min-h-0 w-full flex-col px-3 py-3">
                <GatedLink
                    href="/dashboard"
                    aria-label="Studio"
                    className="group flex min-h-14 items-center rounded-lg px-2 transition hover:bg-white/[0.035] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                >
                    <BrandLogo className="h-9 w-auto" />
                </GatedLink>

                <GatedLink
                    href="/create"
                    aria-current={createSongActive ? "page" : undefined}
                    aria-label="+ Create Song"
                    className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg px-3 text-[14px] font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                        createSongActive
                            ? "bg-saffron text-[#171210] shadow-[0_10px_26px_rgba(227,122,44,0.22)]"
                            : "bg-saffron/90 text-[#171210] shadow-[0_8px_22px_rgba(227,122,44,0.16)] hover:bg-saffron"
                    }`}
                >
                    <Plus className="size-4 shrink-0 stroke-[3]" aria-hidden={true} />
                    <span>Create Song</span>
                </GatedLink>

                <nav
                    aria-label="Studio navigation"
                    className="mt-5 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    <div className="grid gap-1">
                        <RailLink item={HOME_ITEM} active={HOME_ITEM.activeWhen(activeContext)} />
                        <RailLink item={CREATE_ITEM} active={CREATE_ITEM.activeWhen(activeContext)} />
                        {DISCOVER_ITEMS.map((item) => (
                            <RailLink
                                key={item.href}
                                item={item}
                                active={item.activeWhen(activeContext)}
                            />
                        ))}
                        {MY_SPACE_ITEMS.map((item) => (
                            <RailLink
                                key={item.href}
                                item={item}
                                active={item.activeWhen(activeContext)}
                            />
                        ))}
                    </div>
                </nav>

                <div className="mt-4 shrink-0 border-t border-white/[0.08] pt-3">
                    <div className="flex items-center justify-between gap-2 px-2">
                        <span className="inline-flex min-w-0 items-center gap-2 text-[12px] font-bold text-sand/66">
                            <Sparkles className="size-3.5 shrink-0 text-saffron" aria-hidden={true} />
                            <span>{USER.credits} credits</span>
                        </span>
                        <Link
                            href="/pricing"
                            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-saffron/24 px-2.5 text-[12px] font-black text-white transition hover:bg-saffron/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                        >
                            <CreditCard className="size-3.5 text-saffron" aria-hidden={true} />
                            Upgrade
                        </Link>
                    </div>

                    <GatedLink
                        href="/profile"
                        className="mt-3 flex h-12 items-center gap-3 rounded-lg px-2 transition hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                    >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#e37a2c,#2f8f9a)] text-white">
                            <UserRound className="size-4" aria-hidden={true} />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-black leading-tight text-white">
                                {USER.handle}
                            </span>
                            <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-sand/42">
                                {USER.tier}
                            </span>
                        </span>
                    </GatedLink>
                </div>
            </div>
        </aside>
    )
}

function RailLink({
    active,
    item,
}: {
    active: boolean
    item: RailItem
}) {
    const Icon = item.icon

    return (
        <GatedLink
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex min-h-10 items-center gap-3 rounded-lg px-2.5 text-[14px] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                active
                    ? "bg-white/[0.075] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] before:absolute before:left-0 before:top-2 before:h-6 before:w-[3px] before:rounded-full before:bg-saffron"
                    : "text-sand/58 hover:bg-white/[0.04] hover:text-sand"
            }`}
        >
            <Icon
                className={`size-[17px] shrink-0 transition ${
                    active ? "text-saffron" : "text-sand/42 group-hover:text-sand/75"
                }`}
                aria-hidden={true}
            />
            <span className="min-w-0 truncate">{item.label}</span>
        </GatedLink>
    )
}
