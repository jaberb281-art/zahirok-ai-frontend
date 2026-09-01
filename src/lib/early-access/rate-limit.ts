const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 8

interface RateLimitEntry {
  count: number
  resetAt: number
}

const ipBuckets = new Map<string, RateLimitEntry>()

export function checkEarlyAccessRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipBuckets.get(ip)

  if (!entry || now >= entry.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  entry.count += 1
  return true
}
