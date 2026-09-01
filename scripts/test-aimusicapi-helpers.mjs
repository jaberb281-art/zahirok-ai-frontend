/**
 * Helper logic checks (mirrors aimusicapi.ts pure functions).
 * Run: node scripts/test-aimusicapi-helpers.mjs
 */

const GPT_DESCRIPTION_MAX_LENGTH = 400
const TITLE_MAX_LENGTH = 80
const TAGS_MAX_LENGTH = 1000
const AIMUSICAPI_MODEL_VERSION = "sonic-v5"

function truncate(value, maxLength) {
  if (value.length <= maxLength) return value
  return value.slice(0, maxLength).trimEnd()
}

function buildSonicCreatePayload(input) {
  const base = {
    task_type: "create_music",
    mv: AIMUSICAPI_MODEL_VERSION,
    use_suno_cdn: false,
    ...(input.instrumental ? { make_instrumental: true } : {}),
    ...(input.duration ? { duration: input.duration } : {}),
  }

  if (input.useCustomLyrics && input.lyrics?.trim()) {
    return {
      ...base,
      custom_mode: true,
      title: truncate(input.title?.trim() || "Soroz Track", TITLE_MAX_LENGTH),
      tags: truncate(input.tags?.trim() || "Balochi, cinematic, emotional", TAGS_MAX_LENGTH),
      prompt: input.lyrics.trim(),
    }
  }

  return {
    ...base,
    custom_mode: false,
    gpt_description_prompt: truncate(input.prompt.trim(), GPT_DESCRIPTION_MAX_LENGTH),
  }
}

function extractCompletedSong(payload) {
  for (const song of payload.data ?? []) {
    if (typeof song.audio_url === "string" && song.audio_url.startsWith("http")) {
      const state = (song.state ?? "succeeded").toLowerCase()
      if (state === "failed") continue
      return song
    }
  }
  return null
}

function getTaskFailureMessage(payload) {
  const failedSong = (payload.data ?? []).find((song) => song.state?.toLowerCase() === "failed")
  if (failedSong) return "failed"
  if (payload.message?.toLowerCase().includes("fail")) return payload.message
  return null
}

function isTaskStillRunning(payload) {
  const songs = payload.data ?? []
  if (songs.length === 0) return true
  return songs.some((song) => {
    const state = song.state?.toLowerCase()
    return state === "pending" || state === "running" || !state
  })
}

let passed = 0
let failed = 0

function assert(condition, label) {
  if (condition) {
    passed += 1
    console.log("PASS:", label)
  } else {
    failed += 1
    console.error("FAIL:", label)
  }
}

const descriptionPayload = buildSonicCreatePayload({
  prompt: "Balochi cinematic song",
  duration: 30,
  instrumental: true,
})

assert(descriptionPayload.custom_mode === false, "description mode")
assert(descriptionPayload.make_instrumental === true, "instrumental flag")

const customPayload = buildSonicCreatePayload({
  prompt: "ignored",
  lyrics: "[Verse]\nTest lyrics",
  title: "My Song",
  tags: "Balochi, cinematic",
  useCustomLyrics: true,
})

assert(customPayload.custom_mode === true, "custom mode")
assert(customPayload.prompt === "[Verse]\nTest lyrics", "lyrics as prompt")

assert(
  extractCompletedSong({
    data: [{ state: "succeeded", audio_url: "https://cdn.example.com/song.mp3" }],
  })?.audio_url?.includes("song.mp3"),
  "extract completed song",
)

assert(getTaskFailureMessage({ data: [{ state: "failed" }] }) !== null, "failed task")
assert(isTaskStillRunning({ data: [{ state: "running" }] }) === true, "running task")

console.log(`\n${passed} passed, ${failed} failed`)
process.exitCode = failed > 0 ? 1 : 0
