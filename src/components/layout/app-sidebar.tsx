"use client"

import { useEffect, useRef, useState } from "react"
import type { ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Bell,
    BookOpen,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleUserRound,
    CreditCard,
    FlaskConical,
    Home,
    Library,
    LogOut,
    MoreHorizontal,
    Music,
    Palette,
    Search,
    SlidersHorizontal,
    Sparkles,
    User,
    X,
} from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"

type NavItem = {
    href: string
    label: string
    icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
    isMock?: boolean
}

const MAIN_NAV_ITEMS: NavItem[] = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/feed", label: "Explore", icon: Search },
    { href: "/create", label: "Create", icon: Music },
    // MOCK: placeholder route until Studio ships
    { href: "/studio", label: "Studio", icon: SlidersHorizontal },
    { href: "/library", label: "Library", icon: Library },
    { href: "/notifications", label: "Notifications", icon: Bell },
] as const

const SECONDARY_NAV_ITEMS: NavItem[] = [
    { href: "/labs", label: "Labs", icon: FlaskConical },
] as const

const CONSENT_OPTIONS = [
    {
        key: "performance",
        title: "Performance Cookies",
        description: "Help us understand which Soroz features feel fast, useful, and ready for improvement.",
    },
    {
        key: "functional",
        title: "Functional Cookies",
        description: "Remember interface preferences such as workspace filters, language choices, and display options.",
    },
    {
        key: "marketing",
        title: "Marketing Cookies",
        description: "Support measuring campaign performance and future Soroz creator announcements.",
    },
] as const

type ConsentKey = (typeof CONSENT_OPTIONS)[number]["key"]

const MORE_ITEMS = [
    "Invite friends",
    "Earn Credits",
    "What's new?",
    "Help",
    "About",
    "Blog",
    "Careers",
    "Feedback",
] as const

const SOCIAL_ITEMS = [
    { label: "X", text: "X" },
    { label: "Instagram", text: "IG" },
    { label: "YouTube", text: "YT" },
    { label: "TikTok", text: "TT" },
    { label: "Discord", text: "DC" },
] as const

const sidebarUser: { tier: "free" | "basic" | "pro" | "lifetime" } = {
    tier: "free",
}

function isActivePath(pathname: string, href: string) {
    if (href === "/library") return pathname === "/library" || pathname.startsWith("/song/")
    return pathname === href
}

export function AppSidebar() {
    const pathname = usePathname()
    const profileMenuRef = useRef<HTMLDivElement>(null)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMoreOpen, setIsMoreOpen] = useState(false)
    const [isPoliciesOpen, setIsPoliciesOpen] = useState(false)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
    const [sidebarNotice, setSidebarNotice] = useState<string | null>(null)
    const [consentPreferences, setConsentPreferences] = useState<Record<ConsentKey, boolean>>({
        performance: false,
        functional: false,
        marketing: false,
    })

    const isPoliciesActive = pathname === "/terms" || pathname === "/privacy" || isPoliciesOpen

    useEffect(() => {
        document.documentElement.style.setProperty(
            "--app-sidebar-width",
            isCollapsed ? "76px" : "228px",
        )

        return () => {
            document.documentElement.style.removeProperty("--app-sidebar-width")
        }
    }, [isCollapsed])

    useEffect(() => {
        if (!isProfileMenuOpen) return

        function closeProfileMenuOnOutsideClick(event: PointerEvent) {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node)
            ) {
                setIsProfileMenuOpen(false)
            }
        }

        function closeProfileMenuOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsProfileMenuOpen(false)
            }
        }

        document.addEventListener("pointerdown", closeProfileMenuOnOutsideClick)
        document.addEventListener("keydown", closeProfileMenuOnEscape)

        return () => {
            document.removeEventListener("pointerdown", closeProfileMenuOnOutsideClick)
            document.removeEventListener("keydown", closeProfileMenuOnEscape)
        }
    }, [isProfileMenuOpen])

    useEffect(() => {
        if (!sidebarNotice) return

        const timeoutId = window.setTimeout(() => {
            setSidebarNotice(null)
        }, 2600)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [sidebarNotice])

    function toggleCollapsed() {
        setIsCollapsed((value) => !value)
        setIsMoreOpen(false)
        setIsPoliciesOpen(false)
        setIsProfileMenuOpen(false)
    }

    function toggleConsentPreference(key: ConsentKey) {
        setConsentPreferences((current) => ({
            ...current,
            [key]: !current[key],
        }))
    }

    function rejectAllConsent() {
        setConsentPreferences({
            performance: false,
            functional: false,
            marketing: false,
        })
    }

    function openPoliciesMenu() {
        setIsPoliciesOpen((value) => !value)
        setIsMoreOpen(false)
        setIsProfileMenuOpen(false)
    }

    function showSidebarNotice(message: string) {
        setSidebarNotice(message)
        setIsProfileMenuOpen(false)
    }

    function toggleProfileMenu() {
        setIsProfileMenuOpen((value) => !value)
        setIsMoreOpen(false)
        setIsPoliciesOpen(false)
    }

    return (
        <>
        <aside
            className={`app-sidebar fixed inset-y-0 left-0 z-[90] hidden h-screen flex-col border-e border-white/[0.11] bg-[#0f0f10] text-sand backdrop-blur-md transition-[width] duration-200 lg:flex ${
                isCollapsed ? "w-[72px] lg:w-[76px]" : "w-[228px]"
            }`}
        >
            <div className={`relative flex h-full min-h-0 flex-col pb-4 pt-0 ${isCollapsed ? "px-0" : "px-3"}`}>
                <div className="shrink-0">
                    {isCollapsed ? (
                        <div className="flex flex-col items-center gap-2 pt-4">
                            <Link
                                href="/dashboard"
                                aria-label="Soroz AI home"
                                title="Soroz"
                                className="flex size-10 items-center justify-center overflow-hidden rounded-xl border border-saffron/25 bg-black/40 shadow-[0_0_16px_rgba(227,122,44,0.12)] transition hover:border-saffron/40"
                            >
                                <BrandLogo variant="mark" className="size-10" />
                            </Link>
                            <button
                                type="button"
                                aria-label="Expand sidebar"
                                aria-pressed={true}
                                title="Expand sidebar"
                                onClick={toggleCollapsed}
                                className="inline-flex size-8 items-center justify-center rounded-lg text-sand/45 transition hover:bg-white/[0.06] hover:text-sand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                            >
                                <ChevronRight className="size-[18px]" aria-hidden={true} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex h-[72px] items-center justify-between">
                            <Link href="/dashboard" className="flex min-w-0 items-center" aria-label="Soroz AI home">
                                <BrandLogo className="h-8 w-auto" />
                            </Link>
                            <button
                                type="button"
                                aria-label="Collapse sidebar"
                                aria-pressed={false}
                                onClick={toggleCollapsed}
                                className="inline-flex size-7 items-center justify-center rounded-full text-sand/45 transition hover:bg-white/[0.05] hover:text-sand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                            >
                                <ChevronLeft className="size-[17px] transition-transform" aria-hidden={true} />
                            </button>
                        </div>
                    )}

                    <div ref={profileMenuRef} className="relative">
                        <button
                            type="button"
                            aria-label="Open profile menu"
                            aria-expanded={isProfileMenuOpen}
                            aria-haspopup="menu"
                            onClick={toggleProfileMenu}
                            className={`group flex h-11 w-full items-center gap-3 rounded-lg text-start transition hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                                isCollapsed ? "justify-center px-0" : "px-0.5"
                            } ${isProfileMenuOpen ? "bg-white/[0.04]" : ""}`}
                        >
                            <span className="size-10 shrink-0 rounded-full bg-[radial-gradient(circle_at_28%_28%,#ff4fb5_0%,#ff5533_42%,#6d5dfc_100%)] shadow-[0_0_18px_rgba(227,122,44,0.13)]" />
                            {!isCollapsed && (
                                <>
                                    <span className="min-w-0">
                                        <span className="block truncate text-[14px] font-bold leading-tight text-white">jaberb281</span>
                                        {/* Tier badge */}
                                        {sidebarUser.tier && (
                                            <span
                                                className={[
                                                    "mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                                    sidebarUser.tier === "pro"
                                                        ? "bg-[#e37a2c]/20 text-[#e37a2c] ring-1 ring-[#e37a2c]/30"
                                                        : sidebarUser.tier === "basic"
                                                            ? "bg-white/10 text-sand/70 ring-1 ring-white/10"
                                                            : sidebarUser.tier === "lifetime"
                                                                ? "bg-[#1A3A5C]/60 text-[#e37a2c] ring-1 ring-[#e37a2c]/25"
                                                                : "bg-white/[0.06] text-sand/50 ring-1 ring-white/[0.08]",
                                                ].join(" ")}
                                            >
                                                {sidebarUser.tier === "free" ? "Free" : sidebarUser.tier === "basic" ? "Basic" : sidebarUser.tier === "lifetime" ? "Lifetime" : "Pro"}
                                            </span>
                                        )}
                                        <span className="mt-0.5 block text-[12.5px] font-semibold leading-tight text-sand/48">75 Credits</span>
                                    </span>
                                    <span className="ms-auto inline-flex size-7 items-center justify-center rounded-full text-sand/38 transition group-hover:bg-white/[0.05] group-hover:text-sand">
                                        <ChevronDown
                                            className={`size-3.5 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`}
                                            aria-hidden={true}
                                        />
                                    </span>
                                </>
                            )}
                        </button>

                        {isProfileMenuOpen && (
                            <ProfileMenu
                                collapsed={isCollapsed}
                                onClose={() => setIsProfileMenuOpen(false)}
                                onNotice={showSidebarNotice}
                            />
                        )}

                        {sidebarNotice && (
                            <div
                                role="status"
                                className={`absolute top-[54px] z-[155] rounded-lg border border-saffron/20 bg-[#242428] px-4 py-3 text-sm font-medium text-sand shadow-[0_18px_48px_rgba(0,0,0,0.42)] ${
                                    isCollapsed ? "left-[68px] w-[220px]" : "left-0 right-0"
                                }`}
                            >
                                {sidebarNotice}
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <Link
                            href="/pricing"
                            className="mb-3 mt-3 flex h-10 w-full items-center justify-center rounded-full border border-white/12 bg-transparent px-4 text-[14px] font-semibold text-white transition hover:border-saffron/35 hover:bg-saffron/8"
                        >
                            Upgrade to Pro
                        </Link>
                    )}
                </div>

                {isCollapsed ? (
                    <nav
                        aria-label="Desktop navigation"
                        className="mt-6 flex min-h-0 flex-1 flex-col items-center gap-2.5 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {[...MAIN_NAV_ITEMS, ...SECONDARY_NAV_ITEMS].map((item) => (
                            <SidebarLink
                                key={`${item.label}-${item.href}`}
                                item={item}
                                active={isActivePath(pathname, item.href)}
                                collapsed={true}
                            />
                        ))}
                    </nav>
                ) : (
                    <>
                        <nav
                            aria-label="Primary desktop navigation"
                            className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain pe-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {MAIN_NAV_ITEMS.map((item) => (
                                <SidebarLink
                                    key={`${item.label}-${item.href}`}
                                    item={item}
                                    active={isActivePath(pathname, item.href)}
                                    collapsed={false}
                                />
                            ))}
                        </nav>

                        <nav
                            aria-label="Secondary desktop navigation"
                            className="mt-auto flex shrink-0 flex-col gap-0.5 pt-4"
                        >
                            {SECONDARY_NAV_ITEMS.map((item) => (
                                <SidebarLink
                                    key={item.label}
                                    item={item}
                                    active={isActivePath(pathname, item.href)}
                                    collapsed={false}
                                />
                            ))}

                    <button
                        type="button"
                        aria-expanded={isPoliciesOpen}
                        aria-haspopup="menu"
                        aria-label={isCollapsed ? "Terms and policies" : undefined}
                        title={isCollapsed ? "Terms & Policies" : undefined}
                        onClick={openPoliciesMenu}
                        className={`group flex h-9 items-center gap-3 rounded-lg px-2 text-start text-[14px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                            isPoliciesActive ? "text-white" : "text-sand/48 hover:bg-white/[0.04] hover:text-sand/78"
                        } ${isCollapsed ? "w-11 justify-center" : "w-full"}`}
                    >
                        <BookOpen
                            className={`size-[18px] shrink-0 transition ${isPoliciesActive ? "text-white" : "text-sand/45 group-hover:text-sand/75"}`}
                            aria-hidden={true}
                        />
                        {!isCollapsed && <span>Terms & Policies</span>}
                    </button>

                    <button
                        type="button"
                        aria-expanded={isMoreOpen}
                        aria-haspopup="menu"
                        onClick={() => {
                            setIsMoreOpen((value) => !value)
                            setIsPoliciesOpen(false)
                            setIsProfileMenuOpen(false)
                        }}
                        className={`group flex h-9 items-center gap-3 rounded-lg px-2 text-start text-[14px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                            isMoreOpen ? "text-white" : "text-sand/48 hover:bg-white/[0.04] hover:text-sand/78"
                        } ${isCollapsed ? "w-11 justify-center" : "w-full"}`}
                    >
                        <MoreHorizontal
                            className={`size-[18px] shrink-0 transition ${isMoreOpen ? "text-white" : "text-sand/45 group-hover:text-sand/75"}`}
                            aria-hidden={true}
                        />
                        {!isCollapsed && <span>More</span>}
                    </button>
                </nav>
                    </>
                )}

                {isPoliciesOpen && (
                    <div
                        role="menu"
                        aria-label="Terms and policies"
                        className={`absolute bottom-[104px] z-[130] w-[192px] rounded-lg border border-white/8 bg-[#242428] p-1 shadow-[0_20px_56px_rgba(0,0,0,0.42)] ${
                            isCollapsed ? "left-[68px]" : "left-[68px]"
                        }`}
                    >
                        <Link
                            href="/terms"
                            role="menuitem"
                            onClick={() => setIsPoliciesOpen(false)}
                            className="block rounded-md px-4 py-3 text-sm font-semibold text-sand/88 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-saffron"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            href="/privacy"
                            role="menuitem"
                            onClick={() => setIsPoliciesOpen(false)}
                            className="block rounded-md px-4 py-3 text-sm font-semibold text-sand/88 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-saffron"
                        >
                            Privacy Policy
                        </Link>
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setIsPoliciesOpen(false)
                                setIsPrivacyModalOpen(true)
                            }}
                            className="block w-full rounded-md px-4 py-3 text-start text-sm font-semibold text-sand/88 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-saffron"
                        >
                            Your Privacy Choices
                        </button>
                    </div>
                )}

                {isMoreOpen && (
                    <div
                        role="menu"
                        aria-label="More navigation"
                        className={`absolute bottom-[104px] z-[120] max-h-[calc(100vh-128px)] w-[240px] overflow-y-auto rounded-lg border border-white/8 bg-[#242428] py-1 shadow-[0_20px_56px_rgba(0,0,0,0.42)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                            isCollapsed ? "left-[68px]" : "left-[68px]"
                        }`}
                    >
                        {/* MOCK: replace with real links/settings later */}
                        <div className="py-1">
                            {MORE_ITEMS.map((label) => (
                                <button
                                    key={label}
                                    type="button"
                                    role="menuitem"
                                    className="block h-12 w-full px-4 text-start text-sm font-semibold text-sand/88 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-saffron"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                            {SOCIAL_ITEMS.map((item) => {
                                return (
                                    <button
                                        key={item.label}
                                        type="button"
                                        aria-label={item.label}
                                        className="inline-flex size-7 items-center justify-center rounded-full text-sand/50 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                                    >
                                        <span className="text-[10px] font-semibold" aria-hidden={true}>
                                            {item.text}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

            </div>
        </aside>
        {isPrivacyModalOpen && (
            <PrivacyPreferenceModal
                consentPreferences={consentPreferences}
                onClose={() => setIsPrivacyModalOpen(false)}
                onRejectAll={rejectAllConsent}
                onTogglePreference={toggleConsentPreference}
            />
        )}
        </>
    )
}

function PrivacyPreferenceModal({
    consentPreferences,
    onClose,
    onRejectAll,
    onTogglePreference,
}: {
    consentPreferences: Record<ConsentKey, boolean>
    onClose: () => void
    onRejectAll: () => void
    onTogglePreference: (key: ConsentKey) => void
}) {
    useEffect(() => {
        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose()
            }
        }

        document.addEventListener("keydown", closeOnEscape)

        return () => {
            document.removeEventListener("keydown", closeOnEscape)
        }
    }, [onClose])

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="privacy-preference-title"
                className="flex max-h-[80vh] w-[calc(100%-32px)] max-w-[560px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#111113] text-sand shadow-[0_28px_90px_rgba(0,0,0,0.62)]"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                    <h2 id="privacy-preference-title" className="text-xl font-bold text-white">
                        Privacy Preference Center
                    </h2>
                    <button
                        type="button"
                        aria-label="Close privacy preference center"
                        onClick={onClose}
                        className="inline-flex size-9 items-center justify-center rounded-full text-sand/60 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                    >
                        <X className="size-5" aria-hidden={true} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-sm leading-6 text-sand/68 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {/* MOCK: replace with real consent management before launch */}
                    <p>
                        When you use Soroz AI, we may use cookies and similar technologies to keep the app
                        working, remember simple preferences, and understand how creators use the product.
                        You can choose which optional categories are active below. These choices are mock
                        preferences until real consent management is connected.
                    </p>

                    <h3 className="mt-7 text-base font-bold text-white">Manage Consent Preferences</h3>

                    <div className="mt-4 overflow-hidden rounded-xl border border-white/12">
                        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4">
                            <div>
                                <p className="font-bold text-white">Strictly Necessary Cookies</p>
                                <p className="mt-1 text-xs text-sand/50">
                                    Required for security, routing, and core app behavior.
                                </p>
                            </div>
                            <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-sand/70">
                                Always Active
                            </span>
                        </div>

                        {CONSENT_OPTIONS.map((option) => (
                            <ConsentPreferenceRow
                                key={option.key}
                                title={option.title}
                                description={option.description}
                                enabled={consentPreferences[option.key]}
                                onToggle={() => onTogglePreference(option.key)}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onRejectAll}
                        className="inline-flex h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 text-sm font-semibold text-white transition hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                    >
                        Reject All
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-12 items-center justify-center rounded-full bg-saffron px-6 text-sm font-semibold text-charcoal transition hover:bg-saffron/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                    >
                        Confirm My Choices
                    </button>
                </div>
            </div>
        </div>
    )
}

function ProfileMenu({
    collapsed,
    onClose,
    onNotice,
}: {
    collapsed: boolean
    onClose: () => void
    onNotice: (message: string) => void
}) {
    return (
        <div
            role="menu"
            aria-label="Profile menu"
            className={`absolute top-[54px] z-[150] w-[244px] rounded-lg border border-white/8 bg-[#242428] py-1.5 shadow-[0_20px_56px_rgba(0,0,0,0.48)] ${
                collapsed ? "left-[68px]" : "left-[52px]"
            }`}
        >
            <ProfileMenuLink
                href="/profile"
                icon={User}
                label="Profile"
                onClick={onClose}
            />
            <ProfileMenuLink
                href="/pricing"
                icon={CreditCard}
                label="Subscription"
                onClick={onClose}
            />
            <ProfileMenuLink
                href="/account"
                icon={CircleUserRound}
                label="Account"
                onClick={onClose}
            />
            <ProfileMenuButton
                icon={Palette}
                label="Theme"
                trailingIcon={ChevronRight}
                onClick={() => onNotice("Theme settings coming soon.")}
            />
            <ProfileMenuButton
                icon={Sparkles}
                label="My Taste"
                onClick={() => onNotice("Taste profile coming soon.")}
            />
            <ProfileMenuButton
                icon={LogOut}
                label="Sign Out"
                onClick={() => onNotice("Sign out coming soon.")}
            />
        </div>
    )
}

function ProfileMenuLink({
    href,
    icon: Icon,
    label,
    onClick,
}: {
    href: string
    icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
    label: string
    onClick: () => void
}) {
    return (
        <Link
            href={href}
            role="menuitem"
            onClick={onClick}
            className="flex h-14 w-full items-center gap-3 px-4 text-start text-[15px] font-semibold text-sand/90 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-saffron"
        >
            <Icon className="size-[18px] shrink-0 text-sand/52" aria-hidden={true} />
            <span className="min-w-0 flex-1 truncate">{label}</span>
        </Link>
    )
}

function ProfileMenuButton({
    icon: Icon,
    label,
    onClick,
    trailingIcon: TrailingIcon,
}: {
    icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
    label: string
    onClick: () => void
    trailingIcon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>
}) {
    return (
        <button
            type="button"
            role="menuitem"
            onClick={onClick}
            className="flex h-14 w-full items-center gap-3 px-4 text-start text-[15px] font-semibold text-sand/90 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-saffron"
        >
            <Icon className="size-[18px] shrink-0 text-sand/52" aria-hidden={true} />
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {TrailingIcon ? (
                <TrailingIcon className="size-4 shrink-0 text-sand/56" aria-hidden={true} />
            ) : null}
        </button>
    )
}

function ConsentPreferenceRow({
    title,
    description,
    enabled,
    onToggle,
}: {
    title: string
    description: string
    enabled: boolean
    onToggle: () => void
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 last:border-b-0">
            <div className="min-w-0">
                <p className="font-bold text-white">{title}</p>
                <p className="mt-1 text-xs leading-5 text-sand/50">{description}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={`${title}: ${enabled ? "enabled" : "disabled"}`}
                onClick={onToggle}
                className={`relative h-8 w-14 shrink-0 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                    enabled ? "bg-saffron" : "bg-white"
                }`}
            >
                <span
                    className={`absolute top-1 size-6 rounded-full bg-[#0d0d0e] transition ${
                        enabled ? "left-7" : "left-1"
                    }`}
                    aria-hidden={true}
                />
            </button>
        </div>
    )
}

function SidebarLink({
    item,
    active,
    collapsed,
}: {
    item: NavItem
    active: boolean
    collapsed: boolean
}) {
    const Icon = item.icon
    const linkClassName = [
        "group relative flex h-9 items-center gap-3 rounded-lg px-2",
        "text-[14px] font-semibold transition",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e37a2c]",
        active
            ? [
                "bg-[#e37a2c]/10 text-[#e37a2c]",
                "before:absolute before:start-0 before:top-1/2",
                "before:h-5 before:w-[3px] before:-translate-y-1/2",
                "before:rounded-full before:bg-[#e37a2c]",
            ].join(" ")
            : "text-sand/55 hover:bg-white/[0.04] hover:text-sand/85",
        collapsed ? "w-11 justify-center before:hidden" : "w-full",
    ]
        .filter(Boolean)
        .join(" ")

    if (item.isMock) {
        return (
            <a
                href={item.href}
                className={linkClassName}
                onClick={(event) => event.preventDefault()}
                aria-label={collapsed ? item.label : undefined}
                title={collapsed ? item.label : undefined}
            >
                <Icon
                    className={`size-[18px] shrink-0 transition ${
                        active
                            ? "text-[#e37a2c]"
                            : "text-sand/45 group-hover:text-sand/75"
                    }`}
                    aria-hidden={true}
                />
                {!collapsed && <span>{item.label}</span>}
            </a>
        )
    }

    return (
        <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={collapsed ? item.label : undefined}
            title={collapsed ? item.label : undefined}
            className={linkClassName}
        >
            <Icon
                className={`size-[18px] shrink-0 transition ${
                    active
                        ? "text-[#e37a2c]"
                        : "text-sand/45 group-hover:text-sand/75"
                }`}
                aria-hidden={true}
            />
            {!collapsed && <span>{item.label}</span>}
        </Link>
    )
}
