"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ChevronLeft, ChevronRight, Music2, Sparkles, X } from "lucide-react"

import {
  CREATOR_TYPES,
  INTERESTS,
  LANGUAGES,
  WORKFLOWS,
  type EarlyAccessSubmissionInput,
} from "@/lib/early-access/validation"

const STEPS = [
  { id: 1, label: "You" },
  { id: 2, label: "Your Music" },
  { id: 3, label: "Your Workflow" },
  { id: 4, label: "Stay Connected" },
] as const

interface EarlyAccessModalProps {
  open: boolean
  onClose: () => void
}

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
}

function SelectionChip({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron ${
        active
          ? "border-saffron/45 bg-saffron/12 text-white shadow-[0_10px_30px_rgba(227,122,44,0.12)]"
          : "border-white/10 bg-white/[0.04] text-white/72 hover:border-white/18 hover:bg-white/[0.07] hover:text-white"
      }`}
    >
      {label}
    </button>
  )
}

function OptionButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron ${
        active
          ? "border-saffron/45 bg-saffron/10 text-white"
          : "border-white/10 bg-white/[0.04] text-white/72 hover:border-white/18 hover:bg-white/[0.07]"
      }`}
    >
      <span>{label}</span>
      {active ? <Check className="size-4 text-saffron" aria-hidden="true" /> : null}
    </button>
  )
}

export function EarlyAccessModal({ open, onClose }: EarlyAccessModalProps) {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [creatorTypes, setCreatorTypes] = useState<EarlyAccessSubmissionInput["creatorTypes"]>([])
  const [languages, setLanguages] = useState<EarlyAccessSubmissionInput["languages"]>([])
  const [interests, setInterests] = useState<EarlyAccessSubmissionInput["interests"]>([])
  const [currentWorkflow, setCurrentWorkflow] =
    useState<EarlyAccessSubmissionInput["currentWorkflow"] | "">("")
  const [runsMusicChannel, setRunsMusicChannel] = useState<"Yes" | "No" | "">("")
  const [channelUrl, setChannelUrl] = useState("")
  const [email, setEmail] = useState("")
  const [socialUrl, setSocialUrl] = useState("")

  useEffect(() => {
    if (!open) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [onClose, open, submitting])

  useEffect(() => {
    if (!open) {
      setStep(1)
      setSubmitting(false)
      setError("")
      setSuccess(false)
      setCreatorTypes([])
      setLanguages([])
      setInterests([])
      setCurrentWorkflow("")
      setRunsMusicChannel("")
      setChannelUrl("")
      setEmail("")
      setSocialUrl("")
    }
  }, [open])

  const canContinue = useMemo(() => {
    if (step === 1) return creatorTypes.length > 0
    if (step === 2) return languages.length > 0 && interests.length > 0
    if (step === 3) return Boolean(currentWorkflow) && Boolean(runsMusicChannel)
    if (step === 4) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    return false
  }, [creatorTypes.length, currentWorkflow, email, interests.length, languages.length, runsMusicChannel, step])

  async function handleSubmit() {
    if (!canContinue || submitting) return

    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          creatorTypes,
          languages,
          interests,
          currentWorkflow,
          runsMusicChannel,
          channelUrl: channelUrl.trim() || undefined,
          socialUrl: socialUrl.trim() || undefined,
        }),
      })

      const payload = (await response.json()) as { success?: boolean; error?: string }

      if (!response.ok || !payload.success) {
        setError(payload.error ?? "Unable to submit right now. Please try again.")
        return
      }

      setSuccess(true)
    } catch {
      setError("Unable to submit right now. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[220] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close early access form"
        className="absolute inset-0"
        onClick={() => {
          if (!submitting) onClose()
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="early-access-title"
        className="relative z-10 flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[1.75rem] border border-white/10 bg-[#111113] shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:rounded-[1.75rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-white/8 bg-[radial-gradient(circle_at_50%_0%,rgba(227,122,44,0.18),transparent_38%),#111113] px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-saffron/25 bg-saffron/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-saffron">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Early Access
              </div>
              <h2 id="early-access-title" className="mt-3 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
                {success ? "Suroz is coming." : "Join Suroz Early Access"}
              </h2>
              {!success ? (
                <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/58">
                  Suroz is almost here. We&apos;re preparing Suroz for musicians, creators and
                  listeners. Join early access and help shape what comes next.
                </p>
              ) : (
                <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/58">
                  You&apos;re on the early access list. We&apos;ll let you know when Suroz opens its
                  doors.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
              aria-label="Close"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          {!success ? (
            <div className="mt-5 grid grid-cols-4 gap-2">
              {STEPS.map((item) => (
                <div key={item.id} className="min-w-0">
                  <div
                    className={`h-1 rounded-full transition ${
                      step >= item.id ? "bg-saffron" : "bg-white/10"
                    }`}
                  />
                  <p
                    className={`mt-2 truncate text-[11px] font-black uppercase tracking-[0.08em] ${
                      step === item.id ? "text-saffron" : "text-white/38"
                    }`}
                  >
                    {item.id} — {item.label}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex size-16 items-center justify-center rounded-full border border-saffron/25 bg-saffron/10 text-saffron">
                <Music2 className="size-7" aria-hidden="true" />
              </div>
              <p className="mt-5 text-lg font-black text-white">Welcome to the waitlist.</p>
              <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-white/58">
                We&apos;ll email you when Suroz is ready for creators like you.
              </p>
            </div>
          ) : null}

          {!success && step === 1 ? (
            <div>
              <h3 className="text-lg font-black text-white">What best describes you?</h3>
              <p className="mt-1 text-sm font-semibold text-white/50">Select one or more.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {CREATOR_TYPES.map((type) => (
                  <SelectionChip
                    key={type}
                    label={type}
                    active={creatorTypes.includes(type)}
                    onClick={() =>
                      setCreatorTypes((current) => toggleValue(current, type))
                    }
                  />
                ))}
              </div>
            </div>
          ) : null}

          {!success && step === 2 ? (
            <div className="space-y-7">
              <div>
                <h3 className="text-lg font-black text-white">
                  What language(s) do you create or listen to?
                </h3>
                <p className="mt-1 text-sm font-semibold text-white/50">Select all that apply.</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {LANGUAGES.map((language) => (
                    <SelectionChip
                      key={language}
                      label={language}
                      active={languages.includes(language)}
                      onClick={() =>
                        setLanguages((current) => toggleValue(current, language))
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">
                  What are you most interested in creating with Suroz?
                </h3>
                <p className="mt-1 text-sm font-semibold text-white/50">Select all that apply.</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {INTERESTS.map((interest) => (
                    <SelectionChip
                      key={interest}
                      label={interest}
                      active={interests.includes(interest)}
                      onClick={() =>
                        setInterests((current) => toggleValue(current, interest))
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {!success && step === 3 ? (
            <div className="space-y-7">
              <div>
                <h3 className="text-lg font-black text-white">How do you currently create music?</h3>
                <div className="mt-4 grid gap-2">
                  {WORKFLOWS.map((workflow) => (
                    <OptionButton
                      key={workflow}
                      label={workflow}
                      active={currentWorkflow === workflow}
                      onClick={() => setCurrentWorkflow(workflow)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">
                  Do you run a YouTube or music channel?
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {(["Yes", "No"] as const).map((option) => (
                    <OptionButton
                      key={option}
                      label={option}
                      active={runsMusicChannel === option}
                      onClick={() => setRunsMusicChannel(option)}
                    />
                  ))}
                </div>
              </div>

              {runsMusicChannel === "Yes" ? (
                <label className="block">
                  <span className="text-sm font-bold text-white/72">Channel link (optional)</span>
                  <input
                    type="url"
                    value={channelUrl}
                    onChange={(event) => setChannelUrl(event.target.value)}
                    placeholder="https://youtube.com/@yourchannel"
                    className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white outline-none placeholder:text-white/30 focus:border-saffron/35"
                  />
                </label>
              ) : null}
            </div>
          ) : null}

          {!success && step === 4 ? (
            <div>
              <h3 className="text-lg font-black text-white">
                Where should we send your Suroz launch invitation?
              </h3>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-white/72">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white outline-none placeholder:text-white/30 focus:border-saffron/35"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-white/72">
                    YouTube / Instagram / website (optional)
                  </span>
                  <input
                    type="url"
                    value={socialUrl}
                    onChange={(event) => setSocialUrl(event.target.value)}
                    placeholder="https://"
                    className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white outline-none placeholder:text-white/30 focus:border-saffron/35"
                  />
                </label>
              </div>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="mt-4 text-sm font-bold text-[#ff8f73]">
              {error}
            </p>
          ) : null}
        </div>

        {!success ? (
          <div className="flex items-center justify-between gap-3 border-t border-white/8 px-5 py-4 sm:px-7">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(1, current - 1))}
              disabled={step === 1 || submitting}
              className="inline-flex h-11 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-white/75 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((current) => current + 1)}
                disabled={!canContinue || submitting}
                className="inline-flex h-11 items-center gap-1 rounded-full [background:var(--gradient-brand)] px-5 text-sm font-black text-white shadow-[0_14px_36px_rgba(227,122,44,0.28)] transition hover:[background:var(--gradient-brand-hover)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Continue
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canContinue || submitting}
                className="inline-flex h-11 items-center gap-2 rounded-full [background:var(--gradient-brand)] px-5 text-sm font-black text-white shadow-[0_14px_36px_rgba(227,122,44,0.28)] transition hover:[background:var(--gradient-brand-hover)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {submitting ? "Joining..." : "Join Suroz Early Access"}
              </button>
            )}
          </div>
        ) : (
          <div className="border-t border-white/8 px-5 py-4 sm:px-7">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-full items-center justify-center rounded-full [background:var(--gradient-brand)] px-5 text-sm font-black text-white"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
