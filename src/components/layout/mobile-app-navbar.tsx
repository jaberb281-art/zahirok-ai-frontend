"use client"

import Link from "next/link"
import { useState } from "react"
import { Bell, MoreHorizontal, Search } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { GatedLink } from "@/components/early-access/gated-link"
import { MobileMoreMenu } from "@/components/layout/mobile-more-menu"

export function MobileAppNavbar() {
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)

    return (
        <>
            <header className="fixed left-0 right-0 top-0 z-[85] flex h-14 items-center justify-between gap-3 bg-[#08080a]/78 px-4 text-sand backdrop-blur-md lg:hidden">
                <GatedLink href="/dashboard" aria-label="Soroz studio" className="flex min-w-0 items-center">
                    <BrandLogo className="h-7 w-auto" />
                </GatedLink>

                <div className="flex shrink-0 items-center gap-1.5">
                    <Link
                        href="/pricing"
                        className="inline-flex h-9 items-center justify-center rounded-full bg-white/[0.08] px-4 text-xs font-black text-white transition hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
                    >
                        Upgrade
                    </Link>
                    <GatedLink
                        href="/feed"
                        aria-label="Discover"
                        className="inline-flex size-9 items-center justify-center rounded-full bg-white/[0.08] text-white transition hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron [&_svg]:pointer-events-none"
                    >
                        <Search className="size-4" aria-hidden="true" />
                    </GatedLink>
                    <GatedLink
                        href="/notifications"
                        aria-label="Notifications"
                        className="inline-flex size-9 items-center justify-center rounded-full bg-white/[0.08] text-white transition hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron [&_svg]:pointer-events-none"
                    >
                        <Bell className="size-4" aria-hidden="true" />
                    </GatedLink>
                    <button
                        type="button"
                        aria-label="Open more menu"
                        aria-expanded={isMoreMenuOpen}
                        aria-haspopup="dialog"
                        onClick={() => setIsMoreMenuOpen(true)}
                        className="inline-flex size-9 items-center justify-center rounded-full bg-white/[0.08] text-white transition hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron [&_svg]:pointer-events-none"
                    >
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                    </button>
                </div>
            </header>

            {isMoreMenuOpen && (
                <MobileMoreMenu onClose={() => setIsMoreMenuOpen(false)} />
            )}
        </>
    )
}
