const GATED_PATH_PREFIXES = [
  "/create",
  "/library",
  "/dashboard",
  "/studio",
  "/feed",
  "/song",
  "/labs",
  "/notifications",
  "/account",
  "/profile",
  "/auth",
  "/voice-of-balochistan",
] as const

const GATED_HREFS = new Set([
  "/create",
  "/library",
  "/dashboard",
  "/studio",
  "/feed",
  "/labs",
  "/notifications",
  "/account",
  "/auth/sign-in",
  "/auth/sign-up",
  "/voice-of-balochistan",
])

export function isLaunchModeEnabled(): boolean {
  const flag =
    process.env.NEXT_PUBLIC_SUROZ_LAUNCH_MODE ?? process.env.SUROZ_LAUNCH_MODE ?? "true"
  return flag !== "false"
}

export function isGatedPath(pathname: string): boolean {
  if (pathname === "/") return false
  if (pathname === "/pricing" || pathname === "/terms" || pathname === "/privacy") {
    return false
  }

  return GATED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function isGatedHref(href: string): boolean {
  const path = href.split("?")[0]?.split("#")[0] ?? href
  if (GATED_HREFS.has(path)) return true
  return GATED_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  )
}

export { GATED_PATH_PREFIXES }
