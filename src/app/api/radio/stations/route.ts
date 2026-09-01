import { NextResponse } from "next/server"

import { fetchRadioBrowserStations } from "@/lib/radio/radio-browser"
import type { RadioStationsResponse } from "@/lib/radio/types"

export const runtime = "nodejs"

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country") ?? undefined
    const language = searchParams.get("language") ?? undefined
    const tag = searchParams.get("tag") ?? undefined
    const q = searchParams.get("q") ?? undefined
    const limit = Number(searchParams.get("limit") ?? "40")

    if (!country && !language && !tag && !q) {
      return NextResponse.json(
        { success: false, error: "Provide country, language, tag, or q." },
        { status: 400 },
      )
    }

    const stations = await fetchRadioBrowserStations({
      country,
      language,
      tag,
      q,
      limit: Number.isFinite(limit) ? limit : 40,
    })

    const body: RadioStationsResponse = { stations }
    return NextResponse.json(body)
  } catch (error) {
    console.error("[radio/stations] failed to load stations", error)
    return NextResponse.json(
      { success: false, error: "Unable to load radio stations right now." },
      { status: 502 },
    )
  }
}
