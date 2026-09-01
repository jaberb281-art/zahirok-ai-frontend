"use client"

import { useEffect, useRef, useState } from "react"
import {
  Ban,
  Camera,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Clipboard,
  Copy,
  Flag,
  Info,
  Link as LinkIcon,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Music,
  Music2,
  Pencil,
  Play,
  Plus,
  Radio,
  Share2,
  ThumbsUp,
  Trash2,
  Upload,
  User,
  Users,
  X,
} from "lucide-react"

const DEFAULT_PROFILE_TAGS = [
  "\"ee\" = long e",
  "\"kh\" = خ",
  "\"gh\" = غ",
  "keep vocals emotional",
  "raw",
  "pronounce as balochi latin phonetics",
]

const BIO_MAX_LENGTH = 1200
const GENRE_MAX_LENGTH = 20
const MAX_GENRES = 5

const SOCIAL_FIELDS = [
  {
    key: "spotify",
    label: "Spotify profile URL",
    placeholder: "https://open.spotify.com/your-profile",
    icon: Radio,
  },
  {
    key: "instagram",
    label: "Instagram profile URL",
    placeholder: "https://www.instagram.com/your-profile",
    icon: Camera,
  },
  {
    key: "tiktok",
    label: "TikTok profile URL",
    placeholder: "https://www.tiktok.com/@your-profile",
    icon: Music2,
  },
  {
    key: "soundcloud",
    label: "SoundCloud profile URL",
    placeholder: "https://soundcloud.com/your-profile",
    icon: Cloud,
  },
  {
    key: "youtube",
    label: "YouTube profile URL",
    placeholder: "https://www.youtube.com/your-profile",
    icon: Play,
  },
  {
    key: "x",
    label: "X profile URL",
    placeholder: "https://x.com/your-profile",
    icon: LinkIcon,
  },
] as const

type SocialKey = (typeof SOCIAL_FIELDS)[number]["key"]
type SocialLinks = Record<SocialKey, string>

const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  spotify: "",
  instagram: "",
  tiktok: "",
  soundcloud: "",
  youtube: "",
  x: "",
}

const SHARE_OPTIONS = ["X", "Facebook", "LinkedIn", "Reddit", "Email"] as const
const CIRCLE_TABS = ["Followers", "Following", "Remixes Inspired"] as const

type CircleTab = (typeof CIRCLE_TABS)[number]

function getProfileUrl(handle: string) {
  const slug = handle.replace(/^@/, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "")
  const origin =
    typeof window === "undefined" ? "https://zahirok.ai" : window.location.origin

  return `${origin}/profile/${slug}`
}

export default function ProfilePage() {
  const actionMenuRef = useRef<HTMLDivElement>(null)
  const [displayName, setDisplayName] = useState("jaberb281")
  const [handle, setHandle] = useState("@jaberb281")
  const [bio, setBio] = useState("")
  const [genres, setGenres] = useState(DEFAULT_PROFILE_TAGS)
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(DEFAULT_SOCIAL_LINKS)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const [draftDisplayName, setDraftDisplayName] = useState(displayName)
  const [draftHandle, setDraftHandle] = useState(handle)
  const [draftBio, setDraftBio] = useState(bio)
  const [draftGenres, setDraftGenres] = useState(genres)
  const [draftGenreInput, setDraftGenreInput] = useState("")
  const [draftSocialLinks, setDraftSocialLinks] = useState<SocialLinks>(socialLinks)
  const [draftCoverImage, setDraftCoverImage] = useState<string | null>(coverImage)
  const [draftAvatarImage, setDraftAvatarImage] = useState<string | null>(avatarImage)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isCircleModalOpen, setIsCircleModalOpen] = useState(false)
  const [activeCircleTab, setActiveCircleTab] = useState<CircleTab>("Following")
  const [isSongsDetailOpen, setIsSongsDetailOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const profileUrl = getProfileUrl(handle)

  useEffect(() => {
    if (!isActionMenuOpen) return

    function closeOnOutsideClick(event: PointerEvent) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setIsActionMenuOpen(false)
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsActionMenuOpen(false)
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick)
    document.addEventListener("keydown", closeOnEscape)

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [isActionMenuOpen])

  useEffect(() => {
    if (!notice) return

    const timeoutId = window.setTimeout(() => {
      setNotice(null)
    }, 2600)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [notice])

  function openEditModal() {
    setDraftDisplayName(displayName)
    setDraftHandle(handle)
    setDraftBio(bio)
    setDraftGenres(genres)
    setDraftGenreInput("")
    setDraftSocialLinks(socialLinks)
    setDraftCoverImage(coverImage)
    setDraftAvatarImage(avatarImage)
    setIsEditOpen(true)
  }

  function saveProfile() {
    const nextHandle = draftHandle.trim().startsWith("@")
      ? draftHandle.trim()
      : `@${draftHandle.trim()}`

    setDisplayName(draftDisplayName.trim() || "jaberb281")
    setHandle(nextHandle === "@" ? "@jaberb281" : nextHandle)
    setBio(draftBio.trim())
    setGenres(draftGenres)
    setSocialLinks(draftSocialLinks)
    setCoverImage(draftCoverImage)
    setAvatarImage(draftAvatarImage)
    setIsEditOpen(false)
    setNotice("Profile updated locally.")
  }

  function updateDraftSocialLink(key: SocialKey, value: string) {
    setDraftSocialLinks((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function copyProfileLink(message = "Profile link copied.") {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setNotice(message)
    } catch {
      setNotice("Profile link ready to copy.")
    }
  }

  function handleMenuNotice(message: string) {
    setNotice(message)
    setIsActionMenuOpen(false)
  }

  function openCircleModal(tab: CircleTab) {
    setActiveCircleTab(tab)
    setIsCircleModalOpen(true)
  }

  function openShareModal() {
    setIsActionMenuOpen(false)
    setIsShareModalOpen(true)
  }

  return (
    <div className="relative min-h-dvh w-full max-w-full overflow-x-hidden bg-[#090909] text-sand">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#090909_0%,#15110f_42%,#090909_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(90deg,rgba(237,227,211,0.38)_1px,transparent_1px),linear-gradient(rgba(237,227,211,0.28)_1px,transparent_1px)] [background-size:32px_32px]" />

      <main className="relative z-10 mx-auto w-full max-w-[1180px] px-4 pb-6 pt-5 md:px-6 md:pt-7 lg:px-8 lg:pb-8">
        <section className="relative min-h-[220px] overflow-hidden rounded-[28px] border border-sand/10 bg-[#171314] shadow-[0_28px_80px_rgba(0,0,0,0.38)] md:min-h-[300px]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg,rgba(255,99,71,0.96) 0%,rgba(227,122,44,0.96) 34%,rgba(246,177,58,0.92) 70%,rgba(28,17,14,0.96) 100%)",
            }}
            aria-hidden="true"
          />
          {coverImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              aria-hidden="true"
            />
          ) : null}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_32%,rgba(255,73,170,0.58),transparent_24%),radial-gradient(circle_at_78%_24%,rgba(255,224,104,0.42),transparent_30%),linear-gradient(to_top,rgba(9,9,9,0.72),transparent_58%)]" aria-hidden="true" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(115deg,rgba(255,255,255,0.55)_0_1px,transparent_1px_9px)]" aria-hidden="true" />

          <div className="relative flex min-h-[220px] flex-col justify-end gap-6 p-5 sm:p-7 md:min-h-[300px] lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-end gap-4">
              <ProfileAvatar imageSrc={avatarImage} className="size-20 md:size-24" />
              <div className="min-w-0 pb-1">
                <h1 className="truncate text-3xl font-black tracking-tight text-white md:text-5xl">
                  {displayName}
                </h1>
                <p className="mt-1 text-sm font-bold text-white/82">{handle}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-black text-white/78">
                  <Play className="size-3 fill-current" aria-hidden="true" />
                  8
                </p>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:pb-1">
              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-black/24 px-5 text-sm font-black text-white shadow-[0_12px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:bg-black/34 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron sm:flex-none"
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </button>
              <button
                type="button"
                aria-label="Play profile songs"
                onClick={() => setNotice("Profile playback coming soon.")}
                className="inline-flex size-14 items-center justify-center rounded-full bg-white text-charcoal shadow-[0_14px_36px_rgba(0,0,0,0.24)] transition hover:bg-saffron hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
              >
                <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        <section className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <StatPill
              icon={<Music className="size-3.5" aria-hidden="true" />}
              label="1 song"
              active={isSongsDetailOpen}
              onClick={() => setIsSongsDetailOpen(true)}
            />
            <StatPill
              icon={<User className="size-3.5" aria-hidden="true" />}
              label="0 followers"
              onClick={() => openCircleModal("Followers")}
            />
            <StatPill
              icon={<Users className="size-3.5" aria-hidden="true" />}
              label="1 following"
              onClick={() => openCircleModal("Following")}
            />
          </div>

          <div className="relative flex items-center gap-2 self-start md:self-auto" ref={actionMenuRef}>
            <button
              type="button"
              aria-label="Open profile actions"
              aria-expanded={isActionMenuOpen}
              aria-haspopup="menu"
              onClick={() => setIsActionMenuOpen((value) => !value)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-sand/8 bg-sand/8 text-sand/78 transition hover:bg-sand/12 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
              <MoreHorizontal className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Share profile"
              onClick={openShareModal}
              className="inline-flex size-11 items-center justify-center rounded-full border border-sand/8 bg-sand/8 text-sand/78 transition hover:bg-sand/12 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
              <Share2 className="size-4.5" aria-hidden="true" />
            </button>

            {isActionMenuOpen ? (
              <div
                role="menu"
                aria-label="Profile actions"
                className="absolute right-0 top-12 z-30 w-[min(210px,calc(100vw-2rem))] rounded-lg border border-white/8 bg-[#242428] py-1.5 shadow-[0_20px_56px_rgba(0,0,0,0.48)]"
              >
                <ActionMenuButton
                  icon={<Share2 className="size-4" aria-hidden="true" />}
                  label="Share to..."
                  onClick={openShareModal}
                />
                <ActionMenuButton
                  icon={<Clipboard className="size-4" aria-hidden="true" />}
                  label="Copy profile link"
                  onClick={() => {
                    setIsActionMenuOpen(false)
                    void copyProfileLink("Profile link copied.")
                  }}
                />
                <ActionMenuButton
                  icon={<Flag className="size-4" aria-hidden="true" />}
                  label="Report profile"
                  onClick={() => handleMenuNotice("Report profile coming soon.")}
                />
                <ActionMenuButton
                  icon={<Ban className="size-4" aria-hidden="true" />}
                  label="Block user"
                  onClick={() => handleMenuNotice("Block user coming soon.")}
                />
              </div>
            ) : null}
          </div>
        </section>

        {notice ? (
          <div
            role="status"
            className="mt-4 inline-flex rounded-full border border-saffron/20 bg-saffron/10 px-4 py-2 text-sm font-black text-saffron"
          >
            {notice}
          </div>
        ) : null}

        {isSongsDetailOpen ? (
          <SongsDetailView onBack={() => setIsSongsDetailOpen(false)} />
        ) : (
          <section className="mt-12">
            <button
              type="button"
              onClick={() => setIsSongsDetailOpen(true)}
              className="inline-flex items-center gap-1 text-lg font-black text-white transition hover:text-saffron focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
              Songs
              <ChevronRight className="size-5 text-sand/60" aria-hidden="true" />
            </button>
            <ProfileSongRow onClick={() => setIsSongsDetailOpen(true)} />
          </section>
        )}

        {!isSongsDetailOpen ? (
          <section className="mt-14">
          <h2 className="text-lg font-black text-white">About</h2>
          <div className="mt-4 rounded-[28px] border border-sand/8 bg-sand/8 p-5 shadow-[0_18px_52px_rgba(0,0,0,0.22)] md:p-8">
            <div className="grid gap-8 md:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)] md:items-center">
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                <ProfileAvatar imageSrc={avatarImage} className="size-24 md:size-28" />
                <div className="min-w-0">
                  <h3 className="truncate text-2xl font-black text-white sm:text-3xl">{displayName}</h3>
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-charcoal transition hover:bg-saffron hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold leading-6 text-sand/58">
                  {bio || "No bio added yet"}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {genres.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-sand/14 bg-sand/8 px-3 py-1 text-xs font-black text-sand/72"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </section>
        ) : null}
      </main>

      {isEditOpen ? (
        <EditProfileModal
          avatarImage={draftAvatarImage}
          bio={draftBio}
          coverImage={draftCoverImage}
          displayName={draftDisplayName}
          genreInput={draftGenreInput}
          genres={draftGenres}
          handle={draftHandle}
          socialLinks={draftSocialLinks}
          onAvatarImageChange={setDraftAvatarImage}
          onBioChange={setDraftBio}
          onCancel={() => setIsEditOpen(false)}
          onCoverImageChange={setDraftCoverImage}
          onDisplayNameChange={setDraftDisplayName}
          onGenreInputChange={setDraftGenreInput}
          onGenresChange={setDraftGenres}
          onHandleChange={setDraftHandle}
          onSave={saveProfile}
          onSocialLinkChange={updateDraftSocialLink}
        />
      ) : null}

      {isShareModalOpen ? (
        <ShareProfileModal
          profileUrl={profileUrl}
          onClose={() => setIsShareModalOpen(false)}
          onCopy={() => {
            setIsShareModalOpen(false)
            void copyProfileLink("Profile link copied.")
          }}
          onMockShare={() => {
            setIsShareModalOpen(false)
            setNotice("Share option coming soon.")
          }}
        />
      ) : null}

      {isCircleModalOpen ? (
        <CircleModal
          activeTab={activeCircleTab}
          avatarImage={avatarImage}
          displayName={displayName}
          onClose={() => setIsCircleModalOpen(false)}
          onTabChange={setActiveCircleTab}
        />
      ) : null}
    </div>
  )
}

function ProfileAvatar({
  className,
  imageSrc,
}: {
  className: string
  imageSrc?: string | null
}) {
  return (
    <span
      className={`relative shrink-0 overflow-hidden rounded-full border border-white/18 bg-[radial-gradient(circle_at_24%_28%,#ff4fb5_0%,#ff5533_43%,#d85cff_100%)] shadow-[0_14px_42px_rgba(0,0,0,0.34)] ${className}`}
      aria-hidden="true"
    >
      {imageSrc ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={imageSrc} alt="" className="h-full w-full object-cover" />
      ) : null}
    </span>
  )
}

function StatPill({
  active = false,
  icon,
  label,
  onClick,
}: {
  active?: boolean
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-black text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
        active
          ? "border-saffron/35 bg-saffron/14 text-saffron"
          : "border-sand/8 bg-sand/8 hover:bg-sand/12"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function ProfileSongRow({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 flex w-full max-w-[420px] items-center gap-3 rounded-lg p-1 text-left transition hover:bg-sand/7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
    >
      <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-[#201816]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/covers/makran-evening.png"
          alt="jannat wabani cover artwork"
          className="h-full w-full object-cover"
        />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-black text-white">jannat wabani</span>
          <span className="shrink-0 rounded border border-sand/14 bg-sand/8 px-1.5 py-0.5 text-[10px] font-black text-sand/58">
            v4.5-all
          </span>
        </span>
        <span className="mt-1 flex items-center gap-1 text-xs font-bold text-sand/52">
          <Play className="size-2.5 fill-current" aria-hidden="true" />
          8
        </span>
      </span>
    </button>
  )
}

function SongsDetailView({ onBack }: { onBack: () => void }) {
  return (
    <section className="mt-7">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-lg font-black text-white transition hover:text-saffron focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
      >
        <ChevronLeft className="size-5 text-sand/64" aria-hidden="true" />
        Songs
      </button>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          className="h-10 rounded-full bg-white px-4 text-sm font-black text-charcoal"
        >
          Recent
        </button>
        <button
          type="button"
          className="h-10 rounded-full border border-sand/12 bg-sand/6 px-4 text-sm font-black text-sand/78 transition hover:bg-sand/10"
        >
          Top
        </button>
      </div>

      <article className="mt-5 w-full max-w-[220px]">
        <button
          type="button"
          className="group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
        >
          <span className="block aspect-square overflow-hidden rounded-xl bg-[#201816] shadow-[0_18px_42px_rgba(0,0,0,0.3)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/covers/makran-evening.png"
              alt="jannat wabani cover artwork"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          </span>
          <span className="mt-3 flex items-center gap-2">
            <span className="truncate text-sm font-black text-white">jannat wabani</span>
            <span className="shrink-0 rounded border border-sand/14 bg-sand/8 px-1.5 py-0.5 text-[10px] font-black text-sand/58">
              v4.5-all
            </span>
          </span>
          <span className="mt-1 block text-sm font-semibold text-sand/48">jaberb281</span>
          <span className="mt-2 flex items-center gap-3 text-xs font-black text-sand/56">
            <span className="inline-flex items-center gap-1">
              <Play className="size-3 fill-current" aria-hidden="true" />
              9
            </span>
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="size-3" aria-hidden="true" />
              0
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="size-3" aria-hidden="true" />
              2
            </span>
          </span>
        </button>
      </article>
    </section>
  )
}

function ActionMenuButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex h-11 w-full items-center gap-3 px-4 text-left text-sm font-black text-sand/88 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-saffron"
    >
      <span className="text-sand/52">{icon}</span>
      {label}
    </button>
  )
}

function ShareProfileModal({
  onClose,
  onCopy,
  onMockShare,
  profileUrl,
}: {
  onClose: () => void
  onCopy: () => void
  onMockShare: () => void
  profileUrl: string
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
      className="fixed inset-0 z-[175] flex items-end justify-center bg-black/76 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-4 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-profile-title"
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[720px] overflow-y-auto rounded-2xl border border-sand/8 bg-[#1d1d20] px-4 py-7 text-center text-sand shadow-[0_32px_110px_rgba(0,0,0,0.68)] sm:rounded-[28px] sm:px-10 sm:py-10"
      >
        <button
          type="button"
          aria-label="Close share profile"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-sand/7 text-sand/62 transition hover:bg-sand/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron sm:right-6 sm:top-6 sm:size-11"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <h2 id="share-profile-title" className="text-2xl font-black text-white">
          Share to...
        </h2>

        <div className="mx-auto mt-7 grid max-w-[430px] grid-cols-3 justify-items-center gap-4 sm:mt-10 sm:flex sm:justify-between sm:gap-3">
          {SHARE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={onMockShare}
              className="group grid min-w-0 justify-items-center gap-2 text-xs font-black text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-sand/7 text-white transition group-hover:bg-saffron sm:size-14">
                {option === "Email" ? (
                  <Mail className="size-4" aria-hidden="true" />
                ) : (
                  <span className="text-[12px] font-black">
                    {option === "Facebook" ? "f" : option === "LinkedIn" ? "in" : option === "Reddit" ? "r" : "X"}
                  </span>
                )}
              </span>
              {option}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-7 flex max-w-[520px] flex-col items-stretch gap-3 rounded-xl border border-sand/10 bg-[#111113] p-3 text-left sm:mt-10 sm:flex-row sm:items-center">
          <LinkIcon className="size-5 shrink-0 text-sand/72" aria-hidden="true" />
          <p className="min-w-0 flex-1 truncate text-sm font-black text-white">
            {profileUrl}
          </p>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-charcoal transition hover:bg-saffron hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
          >
            <Copy className="size-4" aria-hidden="true" />
            Copy
          </button>
        </div>
      </section>
    </div>
  )
}

function CircleModal({
  activeTab,
  avatarImage,
  displayName,
  onClose,
  onTabChange,
}: {
  activeTab: CircleTab
  avatarImage: string | null
  displayName: string
  onClose: () => void
  onTabChange: (tab: CircleTab) => void
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

  const showUser = activeTab === "Following"

  return (
    <div
      className="fixed inset-0 z-[175] flex items-end justify-center bg-black/76 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-4 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="circle-title"
        className="relative flex max-h-[calc(100dvh-2rem)] min-h-0 w-full max-w-[480px] flex-col overflow-hidden rounded-2xl border border-sand/8 bg-[#1d1d20] px-4 py-5 text-sand shadow-[0_32px_110px_rgba(0,0,0,0.68)] sm:min-h-[520px] sm:rounded-[28px] sm:px-6 sm:py-6"
      >
        <button
          type="button"
          aria-label="Close circle"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-sand/7 text-sand/62 transition hover:bg-sand/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron sm:right-5 sm:top-5"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <h2 id="circle-title" className="text-center text-lg font-black text-white">
          {displayName}&apos;s circle
        </h2>

        <div className="mt-6 grid grid-cols-3 border-b border-sand/12 text-[11px] font-black sm:text-sm">
          {CIRCLE_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`relative min-w-0 px-1 pb-3 text-center leading-tight transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                activeTab === tab ? "text-white" : "text-sand/58"
              }`}
            >
              {tab}
              {activeTab === tab ? (
                <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-saffron" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
          {showUser ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <ProfileAvatar imageSrc={avatarImage} className="size-10" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">DistinctInstructor3079</p>
                  <p className="truncate text-xs font-semibold text-sand/48">@distinctinstructor3079</p>
                </div>
              </div>
              <button
                type="button"
                className="h-9 shrink-0 rounded-full border border-sand/16 px-3 text-xs font-black text-white transition hover:bg-sand/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron sm:px-4 sm:text-sm"
              >
                Following
              </button>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm font-semibold text-sand/42">
              Nothing here yet.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function ImageUploadPanel({
  imageSrc,
  label,
  onClear,
  onFileSelect,
}: {
  imageSrc: string | null
  label: string
  onClear: () => void
  onFileSelect: (file: File) => void
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-1.5 text-sm font-black text-sand/78">
        {label}
        <Info className="size-3.5 text-sand/42" aria-hidden="true" />
      </div>
      <div className="relative min-h-[124px] overflow-hidden rounded-xl border border-sand/12 bg-sand/5">
        {imageSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          />
        ) : null}
        <label className="relative z-10 flex min-h-[124px] cursor-pointer flex-col items-center justify-center gap-2 bg-black/10 px-4 text-center text-sand/68 transition hover:bg-black/18 focus-within:outline focus-within:outline-2 focus-within:outline-inset focus-within:outline-saffron">
          <Upload className="size-7" aria-hidden="true" />
          <span className="text-sm font-black text-sand/72">
            {imageSrc ? "Replace photo" : "Upload a photo"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onFileSelect(file)
              event.currentTarget.value = ""
            }}
          />
        </label>
        {imageSrc ? (
          <button
            type="button"
            aria-label="Remove background image"
            onClick={onClear}
            className="absolute bottom-3 right-3 z-20 inline-flex size-9 items-center justify-center rounded-full bg-[#111113] text-white shadow-[0_8px_22px_rgba(0,0,0,0.5)] transition hover:bg-saffron focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        ) : (
          <span className="absolute bottom-3 right-3 z-20 inline-flex size-9 items-center justify-center rounded-full bg-[#111113] text-white shadow-[0_8px_22px_rgba(0,0,0,0.5)]">
            <Pencil className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </section>
  )
}

function SocialInput({
  field,
  onChange,
  value,
}: {
  field: (typeof SOCIAL_FIELDS)[number]
  onChange: (value: string) => void
  value: string
}) {
  const Icon = field.icon

  return (
    <label className="relative block">
      <span className="sr-only">{field.label}</span>
      <Icon
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-sand/58"
        aria-hidden="true"
      />
      <input
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        className="h-12 w-full rounded-xl border border-sand/8 bg-sand/7 pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-sand/58 focus:border-saffron/42 focus:bg-sand/10"
      />
    </label>
  )
}

function EditProfileModal({
  avatarImage,
  bio,
  coverImage,
  displayName,
  genreInput,
  genres,
  handle,
  socialLinks,
  onAvatarImageChange,
  onBioChange,
  onCancel,
  onCoverImageChange,
  onDisplayNameChange,
  onGenreInputChange,
  onGenresChange,
  onHandleChange,
  onSave,
  onSocialLinkChange,
}: {
  avatarImage: string | null
  bio: string
  coverImage: string | null
  displayName: string
  genreInput: string
  genres: string[]
  handle: string
  socialLinks: SocialLinks
  onAvatarImageChange: (value: string | null) => void
  onBioChange: (value: string) => void
  onCancel: () => void
  onCoverImageChange: (value: string | null) => void
  onDisplayNameChange: (value: string) => void
  onGenreInputChange: (value: string) => void
  onGenresChange: (value: string[]) => void
  onHandleChange: (value: string) => void
  onSave: () => void
  onSocialLinkChange: (key: SocialKey, value: string) => void
}) {
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel()
      }
    }

    document.addEventListener("keydown", closeOnEscape)

    return () => {
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [onCancel])

  function readImageFile(file: File, onChange: (value: string | null) => void) {
    if (!file.type.startsWith("image/")) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  function addGenre() {
    const nextGenre = genreInput.trim()
    if (!nextGenre || genres.length >= MAX_GENRES) return
    if (genres.some((genre) => genre.toLowerCase() === nextGenre.toLowerCase())) {
      onGenreInputChange("")
      return
    }

    onGenresChange([...genres, nextGenre])
    onGenreInputChange("")
  }

  function removeGenre(tag: string) {
    onGenresChange(genres.filter((genre) => genre !== tag))
  }

  return (
    <div
      className="fixed inset-0 z-[170] flex items-end justify-center bg-black/74 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-4 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-sand/10 bg-[#1d1d20] text-sand shadow-[0_32px_110px_rgba(0,0,0,0.68)] sm:rounded-[28px]"
      >
        <div className="flex shrink-0 items-center justify-center border-b border-sand/10 px-5 py-4 sm:px-6 sm:py-5">
          <h2 id="edit-profile-title" className="text-xl font-black text-white">
            Edit Profile
          </h2>
          <button
            type="button"
            aria-label="Close edit profile"
            onClick={onCancel}
            className="absolute right-4 top-3 inline-flex size-10 items-center justify-center rounded-full bg-sand/7 text-sand/62 transition hover:bg-sand/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron sm:right-5 sm:top-4"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-color:rgba(237,227,211,0.34)_transparent] sm:px-7 sm:py-5">
          <ImageUploadPanel
            imageSrc={coverImage}
            label="Background image"
            onClear={() => onCoverImageChange(null)}
            onFileSelect={(file) => readImageFile(file, onCoverImageChange)}
          />

          <div className="mt-6">
            <div className="mb-3 flex items-center gap-1.5 text-sm font-black text-sand/78">
              Profile picture
              <Info className="size-3.5 text-sand/42" aria-hidden="true" />
            </div>
            <div className="relative size-24">
              <ProfileAvatar imageSrc={avatarImage} className="size-24" />
              <label className="absolute bottom-0 right-0 inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#111113] text-white shadow-[0_8px_22px_rgba(0,0,0,0.5)] transition hover:bg-saffron focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-saffron">
                <Camera className="size-4" aria-hidden="true" />
                <span className="sr-only">Choose profile picture</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) readImageFile(file, onAvatarImageChange)
                    event.currentTarget.value = ""
                  }}
                />
              </label>
            </div>
            {avatarImage ? (
              <button
                type="button"
                onClick={() => onAvatarImageChange(null)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-sand/48 transition hover:text-white"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Remove picture
              </button>
            ) : null}
          </div>

          <div className="mt-8 grid gap-5">
          <ProfileField
            label="Display name"
            value={displayName}
            onChange={onDisplayNameChange}
          />
          <label className="grid gap-2">
              <span className="text-sm font-black text-sand/78">Add a bio</span>
              <div className="relative">
                <textarea
                  value={bio}
                  maxLength={BIO_MAX_LENGTH}
                  onChange={(event) => onBioChange(event.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-sand/8 bg-sand/7 px-4 py-3 pb-8 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-sand/38 focus:border-saffron/42 focus:bg-sand/10"
                  placeholder="Tell us about yourself..."
                />
                <span className="absolute bottom-3 right-4 text-xs font-black text-sand/34">
                  {bio.length}/{BIO_MAX_LENGTH}
                </span>
              </div>
          </label>
            <ProfileField
              label="Handle*"
              value={handle}
              onChange={onHandleChange}
            />
          </div>

          <section className="mt-8">
            <h3 className="text-sm font-black text-white">Genres Override</h3>
            <p className="mt-2 text-xs font-semibold leading-5 text-sand/58">
              Add up to 5 genres to describe your music style. If this is empty,
              the genres will be inferred from your most popular songs
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <input
                  type="text"
                  value={genreInput}
                  maxLength={GENRE_MAX_LENGTH}
                  onChange={(event) => onGenreInputChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      addGenre()
                    }
                  }}
                  placeholder="Type a genre..."
                  className="h-12 w-full rounded-full border border-sand/8 bg-sand/7 pl-4 pr-14 text-sm font-semibold text-white outline-none transition placeholder:text-sand/34 focus:border-saffron/42 focus:bg-sand/10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-sand/40">
                  {genreInput.length}/{GENRE_MAX_LENGTH}
                </span>
              </div>
              <button
                type="button"
                disabled={genres.length >= MAX_GENRES || genreInput.trim().length === 0}
                onClick={addGenre}
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full border border-sand/8 bg-sand/7 px-4 text-sm font-black text-sand transition hover:bg-sand/10 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => removeGenre(genre)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-sand/10 bg-sand/9 px-3 py-1.5 text-xs font-black text-white transition hover:bg-sand/14 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                >
                  {genre}
                  <X className="size-3" aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-sm font-black text-white">Social networks</h3>
            <div className="mt-3 grid gap-3">
              {SOCIAL_FIELDS.map((field) => (
                <SocialInput
                  key={field.key}
                  field={field}
                  value={socialLinks[field.key]}
                  onChange={(value) => onSocialLinkChange(field.key, value)}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-sand/10 bg-[#1d1d20] px-4 py-4 sm:flex-row sm:px-7 sm:py-5">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-sand/14 bg-transparent px-5 text-sm font-black text-white transition hover:bg-sand/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-charcoal transition hover:bg-saffron hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
          >
            Save
          </button>
        </div>
      </section>
    </div>
  )
}

function ProfileField({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-sand/78">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-sand/8 bg-sand/7 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-sand/32 focus:border-saffron/42 focus:bg-sand/10"
      />
    </label>
  )
}
