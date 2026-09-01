"use client"

import { Globe } from "lucide-react"

export type Language = "english" | "balochi"

/** @deprecated Prefer `Language` — kept for existing imports. */
export type UiLanguage = Language

type LanguageSwitcherProps = {
  value: Language
  onChange: (value: Language) => void
  className?: string
}

const OPTIONS: { value: Language; label: string }[] = [
  { value: "english", label: "English" },
  { value: "balochi", label: "Balochi" },
]

export function LanguageSwitcher({
  className = "",
  onChange,
  value,
}: LanguageSwitcherProps) {
  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex h-10 items-center gap-1.5 rounded-full border border-sand/10 bg-black/20 p-1 ${className}`}
    >
      <Globe className="ml-1.5 size-3.5 shrink-0 text-sand/45" aria-hidden="true" />
      {OPTIONS.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`cursor-pointer rounded-full px-3.5 text-xs font-black transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron ${
              isActive
                ? "bg-saffron text-white"
                : "text-sand/50 hover:text-sand/80"
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/** @deprecated Prefer `LanguageSwitcher`. */
export const LanguageToggle = LanguageSwitcher
