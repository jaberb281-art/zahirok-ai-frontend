type BrandLogoProps = {
  className?: string
  /** Full wordmark, or center-cropped mark for compact/icon slots. */
  variant?: "full" | "mark"
}

/**
 * Official Soroz wordmark from `/public/logo/logo.png`.
 * Prefer `full` in headers; use `mark` only in tight/icon layouts.
 */
export function BrandLogo({ className, variant = "full" }: BrandLogoProps) {
  const isMark = variant === "mark"

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo/logo.png"
      alt="Soroz"
      width={2172}
      height={724}
      className={
        isMark
          ? `object-cover object-center ${className ?? "size-8"}`
          : `h-8 w-auto ${className ?? ""}`.trim()
      }
      decoding="async"
    />
  )
}
