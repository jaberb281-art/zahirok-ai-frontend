import { NextResponse } from "next/server"

import { checkEarlyAccessRateLimit } from "@/lib/early-access/rate-limit"
import {
  EarlyAccessDuplicateError,
  saveEarlyAccessSubmission,
} from "@/lib/early-access/repository"
import { earlyAccessSubmissionSchema } from "@/lib/early-access/validation"

export const runtime = "nodejs"

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown"
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown"
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ip = getClientIp(request)
    if (!checkEarlyAccessRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 },
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: "Request body must be valid JSON." },
        { status: 400 },
      )
    }

    const parsed = earlyAccessSubmissionSchema.safeParse(body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      return NextResponse.json(
        { success: false, error: issue?.message ?? "Invalid submission." },
        { status: 400 },
      )
    }

    await saveEarlyAccessSubmission(parsed.data)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof EarlyAccessDuplicateError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 },
      )
    }

    console.error("[early-access] submission failed", error)
    return NextResponse.json(
      { success: false, error: "Unable to save your submission. Please try again." },
      { status: 500 },
    )
  }
}
