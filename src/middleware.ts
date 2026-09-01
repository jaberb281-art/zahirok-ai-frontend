import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { isGatedPath, isLaunchModeEnabled } from "@/lib/launch-mode"

export function middleware(request: NextRequest) {
  if (!isLaunchModeEnabled()) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return NextResponse.next()
  }

  if (!isGatedPath(pathname)) {
    return NextResponse.next()
  }

  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = "/"
  redirectUrl.searchParams.set("earlyAccess", "1")
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo|toturial-guide|clips).*)",
  ],
}
