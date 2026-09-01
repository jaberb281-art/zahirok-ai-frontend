import fs from "node:fs"
import { Client } from "@gradio/client"

const SPACE = "facebook/MusicGen"
const PROMPT = "classical orchestration with elegant melody"

let token = process.env.HF_TOKEN ?? ""
if (!token && fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^HF_TOKEN=(.*)$/)
    if (match) {
      token = match[1].trim().replace(/^["']|["']$/g, "")
    }
  }
}

async function tryCase(label, connectOptions, payload) {
  console.log(`\n=== ${label} ===`)
  try {
    const client = await Client.connect(SPACE, connectOptions)
    const result = await client.predict("/predict_batched", payload)
    console.log("SUCCESS")
    console.log(JSON.stringify(result, null, 2).slice(0, 2500))
    return true
  } catch (error) {
    console.log("FAILED:", error instanceof Error ? error.message : String(error))
    if (error && typeof error === "object" && "stack" in error) {
      console.log(String(error.stack).split("\n").slice(0, 4).join("\n"))
    }
    return false
  }
}

const cases = [
  ["with token, named null melody", { token }, { texts: PROMPT, melodies: null }],
  ["with token, omit melody key", { token }, { texts: PROMPT }],
  ["no token, named null melody", {}, { texts: PROMPT, melodies: null }],
  [
    "with token, positional array",
    { token },
    [PROMPT, null],
  ],
  [
    "with token, example melody wav",
    { token },
    {
      texts: PROMPT,
      melodies: {
        path: "https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav",
        meta: { _type: "gradio.FileData" },
        orig_name: "audio_sample.wav",
        url: "https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav",
      },
    },
  ],
]

for (const [label, connectOptions, payload] of cases) {
  const ok = await tryCase(label, connectOptions, payload)
  if (ok) break
}
