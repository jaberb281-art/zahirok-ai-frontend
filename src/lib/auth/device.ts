import { randomUUID } from "crypto"
import { cookies } from "next/headers"

export const DEVICE_COOKIE_NAME = "suroz_device_id"
const DEVICE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 2

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isValidDeviceId(value: string): boolean {
  return UUID_PATTERN.test(value)
}

export async function getDeviceId(): Promise<string | null> {
  const cookieStore = await cookies()
  const value = cookieStore.get(DEVICE_COOKIE_NAME)?.value?.trim()

  if (!value || !isValidDeviceId(value)) {
    return null
  }

  return value
}

export async function getOrCreateDeviceId(): Promise<string> {
  const cookieStore = await cookies()
  const existing = cookieStore.get(DEVICE_COOKIE_NAME)?.value?.trim()

  if (existing && isValidDeviceId(existing)) {
    return existing
  }

  const deviceId = randomUUID()
  cookieStore.set(DEVICE_COOKIE_NAME, deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DEVICE_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  })

  return deviceId
}
