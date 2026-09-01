import { createHuggingFaceMusicGenProvider } from "../src/lib/music/providers/huggingface-musicgen.ts"

process.env.HF_MUSICGEN_SPACE ??= "facebook/MusicGen"

// Load token from .env.local without printing it
import fs from "node:fs"
if (!process.env.HF_TOKEN && fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^HF_TOKEN=(.*)$/)
    if (match) {
      process.env.HF_TOKEN = match[1].trim().replace(/^["']|["']$/g, "")
    }
  }
}

try {
  const provider = createHuggingFaceMusicGenProvider()
  const result = await provider.generateMusic({
    prompt: "classical orchestration with elegant melody",
    duration: 15,
  })
  console.log("GENERATION_SUCCESS bytes:", result.audio.byteLength)
} catch (error) {
  console.log("GENERATION_FAILED code:", error?.code)
  console.log("GENERATION_FAILED message:", error instanceof Error ? error.message : String(error))
}
