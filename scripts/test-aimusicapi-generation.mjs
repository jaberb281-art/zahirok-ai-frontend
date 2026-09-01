/**
 * Standalone integration test for AI Music API (no TS path aliases).
 * Run: node scripts/test-aimusicapi-generation.mjs
 */
import fs from "node:fs"

const BASE = "https://api.aimusicapi.ai"
const CREATE = "/api/v1/sonic/create"
const TASK = "/api/v1/sonic/task"
const POLL_MS = 18_000
const MAX_POLL_MS = 110_000
const REQUEST_TIMEOUT_MS = 30_000

function loadEnvLocal() {
  if (!fs.existsSync(".env.local")) return
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "")
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function request(path, { method = "GET", body } = {}) {
  const apiKey = process.env.AIMUSICAPI_KEY?.trim()
  if (!apiKey) {
    throw new Error("MISSING_CONFIGURATION: AIMUSICAPI_KEY not set")
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    const payload = await response.json().catch(() => ({}))
    return { ok: response.ok, status: response.status, payload }
  } finally {
    clearTimeout(timeout)
  }
}

loadEnvLocal()

const TEST_PROMPT =
  "A cinematic Balochi-inspired song with emotional male vocals, rubab, traditional percussion, warm strings, a powerful chorus, and modern cinematic production. The song should feel nostalgic, dramatic, and deeply connected to Balochistan."

try {
  const create = await request(CREATE, {
    method: "POST",
    body: {
      task_type: "create_music",
      custom_mode: false,
      mv: "sonic-v5",
      gpt_description_prompt: TEST_PROMPT.slice(0, 400),
      duration: 30,
      use_suno_cdn: false,
    },
  })

  if (!create.ok) {
    console.log("CREATE_FAILED status:", create.status)
    console.log("CREATE_FAILED payload:", JSON.stringify(create.payload))
    process.exit(1)
  }

  const taskId = create.payload?.task_id
  if (!taskId) {
    console.log("CREATE_FAILED: no task_id")
    process.exit(1)
  }

  console.log("CREATE_OK task_id:", taskId)

  const started = Date.now()
  let audioUrl = null
  let duration = null

  while (Date.now() - started < MAX_POLL_MS) {
    const poll = await request(`${TASK}/${encodeURIComponent(taskId)}`)
    const songs = poll.payload?.data ?? []
    const failed = songs.some((song) => song.state === "failed")

    if (failed) {
      console.log("GENERATION_FAILED payload:", JSON.stringify(poll.payload))
      process.exit(1)
    }

    const ready = songs.find(
      (song) =>
        typeof song.audio_url === "string" &&
        song.audio_url.startsWith("http") &&
        song.state !== "failed",
    )

    if (ready?.audio_url) {
      audioUrl = ready.audio_url
      duration = ready.duration
      break
    }

    console.log("POLL waiting...", songs.map((s) => s.state).join(",") || "no data")
    await sleep(POLL_MS)
  }

  if (!audioUrl) {
    console.log("GENERATION_TIMEOUT")
    process.exit(1)
  }

  const audioResponse = await fetch(audioUrl)
  const bytes = (await audioResponse.arrayBuffer()).byteLength

  console.log("GENERATION_SUCCESS")
  console.log("audio_url:", audioUrl)
  console.log("duration:", duration)
  console.log("bytes:", bytes)
  console.log("elapsed_ms:", Date.now() - started)
} catch (error) {
  console.log("GENERATION_FAILED")
  console.log("message:", error instanceof Error ? error.message : String(error))
  process.exit(1)
}
