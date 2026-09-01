"use client"

import { GatedLink } from "@/components/early-access/gated-link"
import { usePathname } from "next/navigation"
import { Compass, Library, Plus, SlidersHorizontal } from "lucide-react"

const MOBILE_NAV = [
    { href: "/dashboard", label: "Studio", icon: SlidersHorizontal },
    { href: "/create", label: "Create Song", icon: Plus },
    { href: "/feed", label: "Discover", icon: Compass },
    { href: "/library", label: "My Studio", icon: Library },
] as const

export function MobileTabBar() {
    const pathname = usePathname()

    return (
        <nav aria-label="Primary mobile navigation" className="fixed bottom-0 left-0 right-0 z-[80] flex h-[var(--app-mobile-tab-bar-height)] items-stretch border-t border-sand/8 bg-charcoal/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden">
            {MOBILE_NAV.map((item) => {
                const Icon = item.icon
                const isActive =
                    pathname === item.href ||
                    (item.href === "/dashboard" && pathname === "/studio") ||
                    (item.href === "/library" && pathname.startsWith("/song/")) ||
                    (item.href === "/create" && pathname.startsWith("/create"))

                return (
                    <GatedLink
                        key={item.href}
                        href={item.href}
                        aria-label={item.label}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex flex-1 items-center justify-center transition ${isActive ? "text-saffron" : "text-sand/45 hover:text-sand/70"
                            }`}
                    >
                        <Icon
                            className={`size-5 ${isActive ? "text-saffron" : "text-sand/40"}`}
                            aria-hidden="true"
                        />
                        <span className="sr-only">{item.label}</span>
                    </GatedLink>
                )
            })}
        </nav>
    )
}
