"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowRight,
  Cloud,
  Flame,
  Globe,
  Headphones,
  Link2,
  Minus,
  Play,
  Plus,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  Users,
  Volume2,
} from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { GatedLink } from "@/components/early-access/gated-link"
import { LandingPrompt } from "@/components/home/landing-prompt"
import { DemoVideoPoster } from "@/components/media/demo-video"
import { getDemoImage } from "@/lib/demo-images"
import { getFeedSongs } from "@/lib/mock-songs"
import { profilePathForCreator } from "@/lib/public-profiles"

const showcaseSongs = getFeedSongs().slice(0, 5)

const marqueeItems = [
  "Built for Balochi creators",
  "Balochi Vocals",
  "Dambora",
  "Doholl",
  "Suroz",
  "Makran Dialect",
  "Coastal Folk",
]

const howItWorksSteps = [
  {
    number: "1",
    title: "Step 1: Describe your sound",
    body: 'Type a mood, a place, or a story. "A slow Dambora melody at sunset on the Makran coast."',
    image: "/toturial-guide/1.png",
  },
  {
    number: "2",
    title: "Step 2: Shape the details",
    body: "Pick your instruments — Dambora, Suroz, Doholl — choose vocal style, language, and energy.",
    image: "/toturial-guide/2.png",
  },
  {
    number: "3",
    title: "Step 3: Hear it come alive",
    body: "Soroz generates a full song draft in seconds. Download, share, or remix it.",
    image: "/toturial-guide/3.png",
  },
]

const honestFeatures = [
  {
    title: "Built around Balochi sound",
    body: "Every style, instrument, and dialect in Soroz comes from Balochi, Makkuran, and coastal folk traditions.",
    visual: "instruments",
  },
  {
    title: "Advanced creation tools",
    body: "Lyrics editor, vocal gender, weirdness, BPM, key, and style influence — the tools serious creators need.",
    visual: "controls",
  },
]

const faqs = [
  {
    question: "What is Soroz AI?",
    answer:
      "Soroz is an AI music creation tool built specifically for Balochi, Makkuran, and coastal folk traditions. You describe a mood, style, or lyrics — Soroz generates a song draft.",
  },
  {
    question: "Is Soroz only for Balochi music?",
    answer:
      "Soroz is optimized for Balochi sound and instruments, but you can create in any style. The Balochi instrument library and dialect support are what make it unique.",
  },
  {
    question: "Can I upload or record audio?",
    answer:
      "Voice upload and audio reference features are in development. Currently you can describe your desired vocal style and the AI will match it.",
  },
  {
    question: "Do I need music experience?",
    answer: "No. If you can describe a feeling or a place, Soroz can turn it into music.",
  },
  {
    question: "Is it free to use?",
    answer:
      "Soroz offers free credits to start. Each generation uses credits. Upgrade for more credits and longer songs.",
  },
]

const footerLinks = [
  { label: "Create", href: "/create" },
  { label: "Explore", href: "/feed" },
  { label: "Pricing", href: "/pricing" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
]

export default function HomePage() {
  return (
    <main className="min-h-dvh w-full max-w-full overflow-x-hidden bg-[#0d0d0f] text-sand">
      <LandingNavbar />
      <LandingHero />
      <InstrumentMarquee />
      <HowItWorksSection />
      <SongShowcaseSection />
      <DriftTeaserSection />
      <HonestFeaturesSection />
      <FaqSection />
      <MobileAppSection />
      <FinalCtaSection />
      <LandingFooter />
    </main>
  )
}

function LandingNavbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="Soroz home"
          className="flex min-w-0 items-center"
        >
          <BrandLogo className="h-8 w-auto sm:h-10" />
        </Link>

        <GatedLink
          href="/create"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-full [background:var(--gradient-brand)] px-5 text-sm font-black text-white shadow-[0_14px_36px_rgba(227,122,44,0.28)] transition hover:[background:var(--gradient-brand-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron sm:h-12 sm:px-6"
        >
          Get Started
        </GatedLink>
      </nav>
    </header>
  )
}

function LandingHero() {
  return (
    <section className="relative isolate flex min-h-[min(720px,88dvh)] items-center overflow-hidden px-4 pb-14 pt-28 text-center sm:px-6 sm:pb-16 sm:pt-32 lg:px-8">
      <div className="absolute inset-0 -z-30 bg-[#09080d]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(88,40,120,0.35),transparent_55%),radial-gradient(circle_at_50%_40%,rgba(227,122,44,0.12),transparent_42%),radial-gradient(circle_at_80%_20%,rgba(140,60,160,0.18),transparent_35%),linear-gradient(180deg,#0c0a12_0%,#09080d_55%,#0d0d0f_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.05] [background-image:radial-gradient(rgba(237,227,211,0.7)_1px,transparent_1px)] [background-size:3px_3px]" />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-5xl">
        <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.08] tracking-[-0.035em] text-white sm:text-5xl md:text-6xl xl:text-[4.25rem]">
          The world&apos;s most{" "}
          <span className="bg-[linear-gradient(135deg,#f6b13a,#e37a2c)] bg-clip-text text-transparent">
            inclusive
          </span>{" "}
          AI music platform.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm font-semibold leading-7 text-white/58 sm:mt-6 sm:text-base sm:leading-8">
          From bedroom producers to global artists.
          <br className="hidden sm:block" />
          From modern beats to ancient instruments. All in Soroz.
        </p>

        <LandingPrompt />
      </div>
    </section>
  )
}

function InstrumentMarquee() {
  const loop = [...marqueeItems, ...marqueeItems]

  return (
    <section className="overflow-hidden border-y border-white/[0.06] bg-[#0f0f11] py-5">
      <div className="landing-marquee flex w-max items-center gap-8">
        {loop.map((label, index) => (
          <span key={`${label}-${index}`} className="inline-flex shrink-0 items-center gap-8">
            <span
              className={`text-sm font-black uppercase tracking-[0.18em] ${
                label === "Built for Balochi creators" ? "text-white/28" : "text-white/55"
              } sm:text-base`}
            >
              {label}
            </span>
            <span className="text-white/20" aria-hidden="true">
              ·
            </span>
          </span>
        ))}
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section className="bg-[#0d0d0f] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden">
          <aside className="flex w-[min(70vw,220px)] shrink-0 snap-start flex-col justify-start rounded-[1.75rem] bg-saffron p-7 shadow-[0_24px_70px_rgba(227,122,44,0.22)] sm:w-[240px] sm:p-8 lg:w-[260px]">
            <h2 className="text-3xl font-black leading-[1.08] tracking-[-0.03em] text-[#171210] sm:text-4xl">
              How to use
              <br />
              Soroz
            </h2>
            <p className="mt-4 text-sm font-semibold leading-6 text-[#171210]/72">
              Three steps. No music experience needed.
            </p>
          </aside>

          {howItWorksSteps.map((step) => (
            <HowItWorksCard key={step.number} step={step} />
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksCard({
  step,
}: {
  step: (typeof howItWorksSteps)[number]
}) {
  return (
    <article className="grid w-[min(92vw,720px)] shrink-0 snap-start grid-cols-1 overflow-hidden rounded-[1.75rem] bg-saffron shadow-[0_24px_70px_rgba(227,122,44,0.18)] sm:w-[760px] sm:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.9fr)] lg:w-[820px]">
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="h-full overflow-hidden rounded-[1.25rem] border border-black/10 bg-[#111113] shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={step.image}
            alt={step.title}
            className="h-full min-h-[200px] w-full object-cover object-top sm:min-h-[260px]"
          />
        </div>
      </div>

      <div className="flex flex-col px-6 pb-6 pt-1 sm:px-7 sm:py-7 sm:pl-2 lg:pr-8">
        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#171210] text-sm font-black text-white">
          {step.number}
        </span>
        <h3 className="mt-5 text-2xl font-black leading-tight tracking-[-0.02em] text-[#171210] sm:text-[1.65rem]">
          {step.title}
        </h3>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#171210]/78 sm:leading-7">
          {step.body}
        </p>
        <GatedLink
          href="/create"
          className="mt-6 inline-flex h-11 w-fit items-center justify-center rounded-xl bg-[#2563eb] px-5 text-sm font-black text-white transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 focus-visible:ring-offset-saffron sm:mt-auto"
        >
          Get Started
        </GatedLink>
      </div>
    </article>
  )
}

function SongShowcaseSection() {
  return (
    <section className="bg-[#0f0f11] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <h2 className="flex flex-wrap items-center gap-2 text-3xl font-black leading-[1.04] tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
              <span>Trending on</span>
              <span className="text-saffron">Soroz</span>
              <TrendingUp className="size-7 text-saffron sm:size-8" aria-hidden="true" />
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-white/58 sm:mt-5 sm:text-base sm:leading-7">
              Explore the most loved AI-generated tracks right now, created by artists and listeners
              around the world.
            </p>
          </div>
          <GatedLink
            href="/feed"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-full border border-white/12 bg-white/[0.04] px-4 text-sm font-black text-white transition hover:border-saffron/35 hover:bg-saffron/10 sm:self-auto"
          >
            View all
            <ArrowRight className="size-4" aria-hidden="true" />
          </GatedLink>
        </div>

        <div className="mt-10 flex snap-x gap-3 overflow-x-auto pb-4 [scrollbar-width:none] sm:mt-12 sm:gap-3.5 [&::-webkit-scrollbar]:hidden">
          {showcaseSongs.map((song, index) => (
            <ShowcaseCard key={song.id} song={song} artwork={getDemoImage(index)} />
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 sm:mt-12 sm:grid-cols-4 sm:gap-2 sm:p-5">
          {TRENDING_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-2xl px-2 py-2 sm:justify-center sm:px-3"
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.iconWrap}`}
              >
                <stat.icon className={`size-5 ${stat.iconClass}`} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-black text-white sm:text-xl">{stat.value}</p>
                <p className="text-xs font-bold text-white/45">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const TRENDING_STATS = [
  {
    value: "50K+",
    label: "Tracks Generated",
    icon: Flame,
    iconWrap: "bg-saffron/15",
    iconClass: "text-saffron",
  },
  {
    value: "120+",
    label: "Countries",
    icon: Globe,
    iconWrap: "bg-sky-400/15",
    iconClass: "text-sky-400",
  },
  {
    value: "25K+",
    label: "Active Creators",
    icon: Users,
    iconWrap: "bg-violet-400/15",
    iconClass: "text-violet-400",
  },
  {
    value: "2M+",
    label: "Songs Listened",
    icon: Headphones,
    iconWrap: "bg-rose-400/15",
    iconClass: "text-rose-400",
  },
] as const

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return String(value)
}

function ShowcaseCard({
  artwork,
  song,
}: {
  artwork: string
  song: (typeof showcaseSongs)[number]
}) {
  const initial = song.creator.trim().charAt(0).toUpperCase() || "S"

  return (
    <article className="group w-[min(62vw,168px)] shrink-0 snap-start sm:w-[180px] lg:w-[196px]">
      <GatedLink
        href={`/song/${song.id}`}
        className="relative block aspect-[16/10] overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-saffron"
      >
        <DemoVideoPoster
          src={artwork}
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />
        <Play
          className="absolute left-2.5 top-2.5 size-3.5 fill-white text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)]"
          aria-hidden="true"
        />
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
            <Play className="size-2.5 fill-current" aria-hidden="true" />
            {formatCount(song.plays)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
            <ThumbsUp className="size-2.5" aria-hidden="true" />
            {formatCount(song.likes)}
          </span>
        </div>
      </GatedLink>

      <div className="mt-2.5 px-0.5">
        <GatedLink
          href={`/song/${song.id}`}
          className="block truncate text-[13px] font-black leading-snug text-white transition hover:text-saffron"
        >
          {song.title}
        </GatedLink>
        <GatedLink
          href={profilePathForCreator(song.creator)}
          className="mt-1.5 inline-flex max-w-full items-center gap-1.5 text-[11px] font-semibold text-white/70 transition hover:text-saffron"
        >
          <span
            aria-hidden="true"
            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e37a2c,#2f8f9a)] text-[9px] font-black text-white"
          >
            {initial}
          </span>
          <span className="truncate">{song.creator}</span>
        </GatedLink>
      </div>
    </article>
  )
}

function DriftTeaserSection() {
  return (
    <section className="bg-[#0a0a0c] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-4xl rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(227,122,44,0.12),transparent_38%),rgba(255,255,255,0.03)] px-6 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:px-10 sm:py-14">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-saffron">Live from The Drift</p>
        <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.03em] text-white sm:text-4xl">
          A living radio of Balochi sound.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-6 text-white/58 sm:text-base">
          Tune in, capture 30 seconds, turn it into a full song.
        </p>

        <DriftWaveform className="mx-auto mt-8 max-w-lg" />

        <p className="mt-6 text-sm font-bold text-white/72">Desert Night Radio is playing now.</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
          66 BPM · Dambora · Calm
        </p>

        <GatedLink
          href="/radio"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-black text-saffron transition hover:text-white"
        >
          Open The Drift
          <ArrowRight className="size-4" aria-hidden="true" />
        </GatedLink>
      </div>
    </section>
  )
}

function DriftWaveform({ className = "" }: { className?: string }) {
  const bars = [18, 32, 48, 24, 55, 36, 44, 27, 62, 31, 52, 22, 40, 58, 33, 46, 38, 54, 29, 50]

  return (
    <div className={`flex h-16 items-end justify-center gap-1 ${className}`} aria-hidden="true">
      {bars.map((height, index) => (
        <span
          key={index}
          className="landing-drift-bar w-1 rounded-full bg-saffron/70"
          style={{
            height: `${height}%`,
            animationDelay: `${index * 0.08}s`,
          }}
        />
      ))}
    </div>
  )
}

function HonestFeaturesSection() {
  return (
    <section className="bg-[#111113] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-5 lg:grid-cols-2">
          {honestFeatures.map((feature) => (
            <article
              key={feature.title}
              className="flex min-h-[320px] flex-col overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-6"
            >
              <h3 className="text-xl font-black text-white">{feature.title}</h3>
              <p className="mt-4 text-sm font-semibold leading-6 text-white/58">{feature.body}</p>
              <FeatureVisual type={feature.visual} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureVisual({ type }: { type: string }) {
  if (type === "controls") {
    return (
      <div className="mt-auto space-y-4 pt-8">
        {["Weirdness", "Style influence"].map((label) => (
          <div key={label}>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
              <span>{label}</span>
              <span>50%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/8">
              <div className="h-full w-1/2 rounded-full [background:var(--gradient-brand)]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-auto flex flex-wrap gap-2 pt-8">
      {["Suroz", "Dambora", "Duholl", "Rabab", "Benju", "Makkuran"].map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-black text-white/70"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="bg-[#101012] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          title="Frequently asked questions"
          body="Everything you need to know about creating with Soroz."
          align="center"
        />

        <div className="mt-10 divide-y divide-white/10">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={faq.question} className="py-1">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-black text-white transition hover:text-saffron focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron sm:py-6 sm:text-lg"
                >
                  {faq.question}
                  {isOpen ? (
                    <Minus className="size-5 shrink-0" aria-hidden="true" />
                  ) : (
                    <Plus className="size-5 shrink-0" aria-hidden="true" />
                  )}
                </button>
                {isOpen && (
                  <p className="pb-5 text-sm font-semibold leading-6 text-white/56 sm:pb-6 sm:text-base sm:leading-7">
                    {faq.answer}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const MOBILE_APP_FEATURES = [
  { label: "Create songs with AI", icon: Sparkles },
  { label: "High quality audio", icon: Volume2 },
  { label: "Cloud sync across devices", icon: Cloud },
  { label: "Share and collaborate", icon: Link2 },
] as const

function MobileAppSection() {
  return (
    <section className="relative overflow-hidden bg-[#07080e] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-[radial-gradient(ellipse_at_50%_100%,rgba(56,120,220,0.22),transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-40 [background-image:radial-gradient(rgba(120,180,255,0.55)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(to_top,black,transparent)]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 xl:gap-16">
        <div className="max-w-xl">
          <h2 className="text-4xl font-black leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.4rem]">
            Your music studio.
            <br />
            <span className="text-[#5eb0ff]">In your pocket.</span>
          </h2>
          <p className="mt-5 text-sm font-semibold leading-6 text-white/70 sm:text-base sm:leading-7">
            Create, edit, and share music on the go with the Soroz mobile app.
          </p>

          <ul className="mt-8 space-y-3.5">
            {MOBILE_APP_FEATURES.map((feature) => (
              <li key={feature.label} className="flex items-center gap-3 text-sm font-bold text-white sm:text-base">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04]">
                  <feature.icon className="size-3.5 text-white/85" aria-hidden="true" />
                </span>
                {feature.label}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#app-store"
              aria-label="Download on the App Store"
              className="inline-flex h-12 items-center gap-2.5 rounded-xl border border-white/12 bg-black px-4 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <AppleIcon className="size-6 text-white" />
              <span className="text-left leading-tight">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.04em] text-white/70">
                  Download on the
                </span>
                <span className="block text-sm font-black text-white">App Store</span>
              </span>
            </a>
            <a
              href="#google-play"
              aria-label="Get it on Google Play"
              className="inline-flex h-12 items-center gap-2.5 rounded-xl border border-white/12 bg-black px-4 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <GooglePlayIcon className="size-6" />
              <span className="text-left leading-tight">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.04em] text-white/70">
                  Get it on
                </span>
                <span className="block text-sm font-black text-white">Google Play</span>
              </span>
            </a>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[560px] items-end justify-center overflow-visible pb-4 pt-6 sm:max-w-[620px] lg:max-w-none lg:justify-end lg:pb-0">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(70,130,255,0.28),transparent_68%)] blur-2xl"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/app_png/SorozApp1.png"
            alt="Soroz mobile app create screen"
            className="relative z-20 w-[52%] max-w-[260px] -rotate-[8deg] drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)] sm:max-w-[300px]"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/app_png/SorozApp2.png"
            alt="Soroz mobile app library screen"
            className="relative z-10 -ml-[12%] w-[52%] max-w-[260px] rotate-[7deg] drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)] sm:max-w-[300px]"
          />
        </div>
      </div>
    </section>
  )
}

function AppleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.365 1.43c0 1.14-.42 2.2-1.18 3.02-.8.86-2.12 1.52-3.28 1.43-.14-1.1.4-2.26 1.16-3.06.8-.86 2.2-1.5 3.3-1.39ZM20.9 17.3c-.55 1.26-.82 1.82-1.54 2.94-.99 1.53-2.39 3.44-4.13 3.45-1.54.02-1.94-.99-4.04-.98-2.1.01-2.54 1-4.08.98-1.74-.01-3.07-1.74-4.06-3.27C1.17 17.5.2 13.7 1.8 10.92c1.12-1.95 2.9-3.09 4.57-3.09 1.7 0 2.77 1.01 4.18 1.01 1.37 0 2.2-1.02 4.2-1.02 1.5 0 3.09.82 4.2 2.24-3.69 2.03-3.1 7.3.95 7.24Z" />
    </svg>
  )
}

function GooglePlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="#EA4335" d="M3.6 2.2 13.9 12 3.6 21.8c-.7-.4-1.2-1.2-1.2-2.1V4.3c0-.9.5-1.7 1.2-2.1Z" />
      <path fill="#FBBC04" d="m13.9 12 2.7-2.7 4.5 2.6c.8.5.8 1.7 0 2.2l-4.5 2.6L13.9 12Z" />
      <path fill="#4285F4" d="M13.9 12 3.6 2.2c.3-.2.7-.3 1.1-.3.5 0 1 .1 1.4.4l10.5 6 2.7 2.7L13.9 12Z" />
      <path fill="#34A853" d="m13.9 12 5.4 5.4-2.7 2.7-10.5 6c-.4.2-.9.4-1.4.4-.4 0-.8-.1-1.1-.3L13.9 12Z" />
    </svg>
  )
}

function FinalCtaSection() {
  return (
    <section className="bg-[#101012] px-4 pb-16 pt-2 text-center sm:px-6 sm:pb-20 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(227,122,44,0.2),transparent_32%),rgba(255,255,255,0.045)] px-5 py-12 shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:rounded-[2rem] sm:px-6 sm:py-16">
        <h2 className="text-3xl font-black leading-tight tracking-[-0.03em] text-white sm:text-5xl">
          Ready to make your first
          <br />
          Soroz track?
        </h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <GatedLink
            href="/auth/sign-up"
            className="inline-flex h-12 w-full items-center justify-center rounded-full [background:var(--gradient-brand)] px-7 text-sm font-black text-white shadow-[0_18px_42px_rgba(227,122,44,0.28)] transition hover:[background:var(--gradient-brand-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron sm:w-auto"
          >
            Join Soroz for free
          </GatedLink>
          <GatedLink
            href="/feed"
            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.055] px-7 text-sm font-black text-white transition hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron sm:w-auto"
          >
            Explore the demo
          </GatedLink>
        </div>
      </div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0d0d0f] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-semibold text-white/42">
          © 2026 Soroz AI. Built for Balochi creators.
        </p>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-white/48">
          {footerLinks.map((link) => (
            link.href === "/pricing" || link.href === "/terms" || link.href === "/privacy" ? (
              <Link key={link.label} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ) : (
              <GatedLink key={link.label} href={link.href} className="transition hover:text-white">
                {link.label}
              </GatedLink>
            )
          ))}
        </nav>
      </div>
    </footer>
  )
}

function SectionHeading({
  align = "left",
  body,
  title,
}: {
  align?: "left" | "center"
  body: string
  title: string
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}>
      <h2 className="text-3xl font-black leading-[1.04] tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-white/58 sm:mt-5 sm:text-lg sm:leading-8">
        {body}
      </p>
    </div>
  )
}
