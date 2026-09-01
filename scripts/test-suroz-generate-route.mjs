/**
 * End-to-end test via Suroz POST /api/music/generate (requires dev server on :3000).
 * Run: node scripts/test-suroz-generate-route.mjs
 */
import fs from "node:fs"

function loadEnvLocal() {
  if (!fs.existsSync(".env.local")) return
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "")
    }
  }
}

loadEnvLocal()

const BASE = process.env.SUROZ_TEST_BASE_URL ?? "http://localhost:3000"
const TEST_PROMPT =
  "A cinematic Balochi-inspired song with emotional male vocals, rubab, traditional percussion, warm strings, a powerful chorus, and modern cinematic production."

async function postGenerate(body) {
  const response = await fetch(`${BASE}/api/music/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({}))
  return { status: response.status, payload }
}

async function main() {
  console.log("TEST empty prompt")
  const empty = await postGenerate({ prompt: "" })
  console.log(empty.status, empty.payload.code, empty.payload.error)

  console.log("\nTEST missing key (temporarily unset)")
  const savedKey = process.env.AIMUSICAPI_KEY
  delete process.env.AIMUSICAPI_KEY
  // Route reads env at provider call time from process.env in server - this test only works
  // when run against a server started without the key. Skipping server-side env manipulation.

  console.log("\nTEST instrumental description")
  const started = Date.now()
  const ok = await postGenerate({
    prompt: TEST_PROMPT,
    duration: 30,
    instrumental: true,
  })
  console.log(ok.status, ok.payload)

  if (!ok.payload?.success) {
    process.exit(1)
  }

  const audioResponse = await fetch(`${BASE}${ok.payload.audioUrl}`)
  const bytes = (await audioResponse.arrayBuffer()).byteLength
  console.log("AUDIO bytes:", bytes, "mime:", audioResponse.headers.get("content-type"))
  console.log("elapsed_ms:", Date.now() - started)

  if (savedKey) process.env.AIMUSICAPI_KEY = savedKey
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
