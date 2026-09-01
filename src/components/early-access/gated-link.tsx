"use client"

import Link from "next/link"
import type { ComponentProps } from "react"

import { useEarlyAccess } from "@/components/early-access/early-access-provider"
import { isGatedHref, isLaunchModeEnabled } from "@/lib/launch-mode"

type GatedLinkProps = ComponentProps<typeof Link>

export function GatedLink({ href, onClick, ...props }: GatedLinkProps) {
  const { openEarlyAccess } = useEarlyAccess()
  const hrefValue = typeof href === "string" ? href : (href.pathname ?? "")
  const gated = isLaunchModeEnabled() && isGatedHref(hrefValue)

  return (
    <Link
      href={href}
      onClick={(event) => {
        if (gated) {
          event.preventDefault()
          openEarlyAccess()
        }
        onClick?.(event)
      }}
      {...props}
    />
  )
}

export function GatedButton({
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { openEarlyAccess } = useEarlyAccess()

  return (
    <button
      type="button"
      onClick={(event) => {
        if (isLaunchModeEnabled()) {
          event.preventDefault()
          openEarlyAccess()
          return
        }
        onClick?.(event)
      }}
      {...props}
    />
  )
}
